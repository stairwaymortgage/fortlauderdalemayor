/* Vercel serverless function: receives the contact.html form and creates a
   contact in GoHighLevel, then attaches the subject + message as a note.

   Credentials come from Vercel environment variables and are never sent to the
   browser: GHL_API_TOKEN (location API key) and GHL_LOCATION_ID. */

const GHL_BASE = 'https://rest.gohighlevel.com/v1';

const NEIGHBORHOOD_FIELD_ID = process.env.GHL_NEIGHBORHOOD_FIELD_ID || '';

function clean(value, max) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  return max && trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

function looksLikeEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/* GHL returns JSON on success and sometimes HTML/plain text on failure, so read
   the body once as text and only parse it when it is actually JSON. */
async function ghlRequest(path, payload, token) {
  const res = await fetch(GHL_BASE + path, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const raw = await res.text();
  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch (err) {
    data = null;
  }

  return { ok: res.ok, status: res.status, data: data, raw: raw };
}

function ghlErrorMessage(result) {
  const data = result.data;
  if (data) {
    if (typeof data.msg === 'string') return data.msg;
    if (typeof data.message === 'string') return data.message;
    if (typeof data.error === 'string') return data.error;
  }
  return 'GoHighLevel responded with status ' + result.status;
}

/* CommonJS export: the repo has no package.json, so Vercel loads this file as
   a CommonJS module. */
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  const token = process.env.GHL_API_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!token || !locationId) {
    console.error('Missing GHL_API_TOKEN or GHL_LOCATION_ID environment variable.');
    return res.status(500).json({ ok: false, error: 'The contact form is not configured yet. Please email instead.' });
  }

  /* Vercel parses JSON bodies for us, but a string can still arrive if the
     client sends an unexpected content-type. */
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (err) {
      return res.status(400).json({ ok: false, error: 'Could not read the submitted form.' });
    }
  }
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ ok: false, error: 'Could not read the submitted form.' });
  }

  const fname = clean(body.fname, 100);
  const lname = clean(body.lname, 100);
  const email = clean(body.email, 200);
  const phone = clean(body.phone, 40);
  const neighborhood = clean(body.neighborhood, 120);
  const subject = clean(body.subject, 120);
  const message = clean(body.message, 5000);

  if (!fname || !email || !message) {
    return res.status(400).json({ ok: false, error: 'Please add your name, email, and a message before sending.' });
  }
  if (!looksLikeEmail(email)) {
    return res.status(400).json({ ok: false, error: 'Please enter a valid email address.' });
  }

  /* Tags keep the routing context queryable inside GHL without needing custom
     field IDs; the full message body goes into the note below. */
  const tags = ['Website Contact Form'];
  if (neighborhood) tags.push('Neighborhood: ' + neighborhood);
  if (subject) tags.push('Topic: ' + subject);

  const contactPayload = {
    locationId: locationId,
    firstName: fname,
    lastName: lname,
    name: [fname, lname].filter(Boolean).join(' '),
    email: email,
    source: 'FortLauderdaleMayor.org contact form',
    tags: tags
  };
  if (phone) contactPayload.phone = phone;
  if (neighborhood && NEIGHBORHOOD_FIELD_ID) {
    contactPayload.customField = { [NEIGHBORHOOD_FIELD_ID]: neighborhood };
  }

  let contactResult;
  try {
    contactResult = await ghlRequest('/contacts/', contactPayload, token);
  } catch (err) {
    console.error('GHL contact request failed:', err);
    return res.status(502).json({ ok: false, error: 'Could not reach the contact system. Please try again shortly.' });
  }

  if (!contactResult.ok) {
    console.error('GHL contact create failed:', contactResult.status, contactResult.raw);
    return res.status(502).json({ ok: false, error: 'Your message could not be delivered. Please try again or email directly.' });
  }

  const contact = (contactResult.data && (contactResult.data.contact || contactResult.data)) || {};
  const contactId = contact.id || contact.contactId || null;

  /* The note carries the subject and message so the context survives even
     though GHL only stores name/email/phone/tags on the contact record. */
  let noteAdded = false;
  if (contactId) {
    const noteLines = [
      'Website contact form submission',
      'Subject: ' + (subject || 'Not specified'),
      'Neighborhood: ' + (neighborhood || 'Not specified'),
      '',
      message
    ];

    try {
      const noteResult = await ghlRequest(
        '/contacts/' + encodeURIComponent(contactId) + '/notes/',
        { body: noteLines.join('\n') },
        token
      );
      noteAdded = noteResult.ok;
      if (!noteResult.ok) {
        console.error('GHL note create failed:', noteResult.status, ghlErrorMessage(noteResult));
      }
    } catch (err) {
      console.error('GHL note request failed:', err);
    }
  } else {
    console.error('GHL contact created without an id in the response; skipping note.');
  }

  /* A failed note does not fail the submission — the contact exists, and the
     message text is in the logs above for recovery. */
  return res.status(200).json({ ok: true, contactId: contactId, noteAdded: noteAdded });
};
