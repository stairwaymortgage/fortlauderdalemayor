/* Vercel serverless function: receives the contact.html form and creates a
   contact in GoHighLevel, then attaches the subject + message as a note.

   Uses the GoHighLevel **v2** API with a Private Integration Token ("pit-…").
   Credentials come from Vercel environment variables and are never sent to the
   browser: GHL_API_TOKEN (Private Integration Token) and GHL_LOCATION_ID.

   Debugging: every GHL call is logged to the Vercel function log with the
   status, the response headers, and the complete raw response body. Set
   GHL_DEBUG_ERRORS=1 to also return GHL's own error text in the JSON response
   so the failure is visible in the browser without opening the Vercel logs. */

/* v2 host. Requires a Private Integration Token (Settings → Private
   Integrations) plus the Version header below on every request. The old v1 host
   (rest.gohighlevel.com/v1) takes a Location API Key instead and rejects "pit-"
   tokens with 401 "Api key is invalid." — checkToken() flags a token that does
   not match this host. */
const GHL_BASE = 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';

const NEIGHBORHOOD_FIELD_ID = process.env.GHL_NEIGHBORHOOD_FIELD_ID || '';
const DEBUG_ERRORS = process.env.GHL_DEBUG_ERRORS === '1' || process.env.GHL_DEBUG_ERRORS === 'true';

function clean(value, max) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  return max && trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

function looksLikeEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/* Copy/paste from the GHL settings screen often drags in a trailing newline, or
   the whole "Bearer xxx" string, either of which produces a 401 that looks
   identical to a bad key. Normalize both before building the header. */
function normalizeToken(raw) {
  if (typeof raw !== 'string') return '';
  let token = raw.trim().replace(/^Bearer\s+/i, '').trim();
  return token.replace(/^["']|["']$/g, '');
}

/* Describes the token WITHOUT logging it: enough to tell a v2 Private
   Integration Token from a v1 location API key, and to catch stray whitespace,
   but never the secret itself. */
function checkToken(raw, token) {
  const notes = [];
  if (raw !== token) notes.push('token had surrounding whitespace/quotes or a "Bearer " prefix (stripped before use)');
  if (token.startsWith('pit-')) {
    notes.push('token shape looks like a v2 Private Integration Token ("pit-") — correct for ' + GHL_BASE);
  } else if (token.split('.').length === 3) {
    notes.push('WRONG TOKEN TYPE: this is a v1 location API key (JWT). The v2 host ' + GHL_BASE + ' expects a Private Integration Token starting with "pit-" (Settings → Private Integrations). A v1 key here returns 401.');
  } else {
    notes.push('token shape is unrecognized (expected a "pit-…" Private Integration Token for the v2 API)');
  }
  return { length: token.length, notes: notes };
}

/* GHL returns JSON on success and sometimes HTML/plain text on failure, so read
   the body once as text and only parse it when it is actually JSON. The raw text
   is kept so the log can show exactly what came back. */
async function ghlRequest(path, payload, token) {
  const url = GHL_BASE + path;
  const started = Date.now();

  /* The Version header is mandatory on the v2 API — omitting it returns 401
     even when the token is valid. */
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      Version: GHL_API_VERSION,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const raw = await res.text();
  let data = null;
  let parseError = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch (err) {
    parseError = err.message;
    data = null;
  }

  return {
    ok: res.ok,
    status: res.status,
    statusText: res.statusText,
    url: url,
    headers: Object.fromEntries(res.headers.entries()),
    ms: Date.now() - started,
    data: data,
    raw: raw,
    parseError: parseError
  };
}

/* GHL spreads its error text across several shapes depending on which layer
   rejected the call, so check all of them before falling back to the status. */
function ghlErrorMessage(result) {
  const data = result.data;
  if (data) {
    if (typeof data.msg === 'string') return data.msg;
    if (typeof data.message === 'string') return data.message;
    if (typeof data.error === 'string') return data.error;
    if (typeof data.error === 'object' && data.error && typeof data.error.message === 'string') return data.error.message;
    if (Array.isArray(data.errors) && data.errors.length) return JSON.stringify(data.errors);
    if (Array.isArray(data.message)) return data.message.join('; ');
  }
  if (result.raw) return String(result.raw).slice(0, 500);
  return 'GoHighLevel responded with status ' + result.status + ' ' + (result.statusText || '');
}

/* One log line per GHL call, with the complete response body. Multi-line and
   labelled because Vercel's log viewer collapses objects. */
function logGhlResult(label, requestId, result, payload) {
  const lines = [
    '[' + requestId + '] ' + label,
    '  POST ' + result.url,
    '  status: ' + result.status + ' ' + (result.statusText || '') + (result.ok ? ' (ok)' : ' (FAILED)'),
    '  duration: ' + result.ms + 'ms',
    '  response headers: ' + JSON.stringify(result.headers),
    '  response body (raw, full): ' + (result.raw === '' ? '<empty>' : result.raw)
  ];
  if (result.parseError) lines.push('  body was not valid JSON: ' + result.parseError);
  if (!result.ok) {
    lines.push('  parsed GHL error: ' + ghlErrorMessage(result));
    /* Echo the request that produced the failure — 422s are usually about a
       field in here. Email/phone are the only PII and they are already in the
       submission, so nothing new is exposed to the log. */
    lines.push('  request payload sent: ' + JSON.stringify(payload));
    if (result.status === 401 || result.status === 403) {
      lines.push('  hint: 401/403 means the Authorization header was rejected — check GHL_API_TOKEN is a "pit-" Private Integration Token, that the Version header is being sent, that the token has the contacts.write / contacts.readonly scopes, and that it belongs to GHL_LOCATION_ID.');
    }
    if (result.status === 404) {
      lines.push('  hint: 404 on ' + result.url + ' means the path is wrong for this API version.');
    }
    if (result.status === 422 || result.status === 400) {
      lines.push('  hint: 400/422 is a payload validation error — the response body above names the offending field.');
    }
  }
  const out = lines.join('\n');
  if (result.ok) console.log(out); else console.error(out);
}

/* CommonJS export: the repo has no package.json, so Vercel loads this file as
   a CommonJS module. */
module.exports = async function handler(req, res) {
  /* Short id so the several log lines from one submission can be read together. */
  const requestId = Math.random().toString(36).slice(2, 8);

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  /* Same two env vars as before the v2 migration; only GHL_API_TOKEN's expected
     value changed (Private Integration Token instead of Location API Key). */
  const rawToken = process.env.GHL_API_TOKEN;
  const token = normalizeToken(rawToken);
  const locationId = clean(process.env.GHL_LOCATION_ID, 100);
  if (!token || !locationId) {
    console.error(
      '[' + requestId + '] Missing GHL credentials: ' +
      'GHL_API_TOKEN ' + (token ? 'present' : 'MISSING') + ', ' +
      'GHL_LOCATION_ID ' + (locationId ? 'present' : 'MISSING') +
      '. Set both in Vercel → Settings → Environment Variables, then redeploy.'
    );
    return res.status(500).json({ ok: false, error: 'The contact form is not configured yet. Please email instead.' });
  }

  const tokenCheck = checkToken(rawToken, token);
  console.log(
    '[' + requestId + '] GHL config: base=' + GHL_BASE +
    ', apiVersion=' + GHL_API_VERSION +
    ', locationId=' + locationId +
    ', token length=' + tokenCheck.length +
    '\n  ' + tokenCheck.notes.join('\n  ')
  );

  /* Vercel parses JSON bodies for us, but a string can still arrive if the
     client sends an unexpected content-type. */
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (err) {
      console.error('[' + requestId + '] Body was a string but not JSON. content-type=' + req.headers['content-type'] + ' raw=' + String(body).slice(0, 500));
      return res.status(400).json({ ok: false, error: 'Could not read the submitted form.' });
    }
  }
  if (!body || typeof body !== 'object') {
    console.error('[' + requestId + '] Unreadable body. content-type=' + req.headers['content-type'] + ' typeof=' + typeof body);
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
  /* v2 takes customFields as an array of {id, value} objects. (v1 used a
     customField object keyed by field id — that shape is rejected here.) */
  if (neighborhood && NEIGHBORHOOD_FIELD_ID) {
    contactPayload.customFields = [{ id: NEIGHBORHOOD_FIELD_ID, value: neighborhood }];
  }

  let contactResult;
  try {
    contactResult = await ghlRequest('/contacts/', contactPayload, token);
  } catch (err) {
    /* Network/DNS/TLS level failure — the request never got a response. */
    console.error(
      '[' + requestId + '] GHL contact request threw before any response:\n' +
      '  name: ' + err.name + '\n' +
      '  message: ' + err.message + '\n' +
      '  cause: ' + (err.cause ? (err.cause.code || err.cause.message || String(err.cause)) : 'none') + '\n' +
      '  stack: ' + err.stack
    );
    return res.status(502).json({
      ok: false,
      error: 'Could not reach the contact system. Please try again shortly.',
      debug: DEBUG_ERRORS ? err.message : undefined
    });
  }

  logGhlResult('GHL create contact', requestId, contactResult, contactPayload);

  /* v1 quietly upserted on a repeat email; v2 rejects the create with 400
     "This location does not allow duplicated contacts." and returns the existing
     id in meta.contactId. Reuse that id so someone writing in a second time
     still gets their message through instead of seeing a delivery error. */
  let contactId = null;
  let wasDuplicate = false;

  if (contactResult.ok) {
    const contact = (contactResult.data && (contactResult.data.contact || contactResult.data)) || {};
    contactId = contact.id || contact.contactId || null;
  } else {
    const meta = (contactResult.data && contactResult.data.meta) || {};
    const existingId = meta.contactId || null;
    if (existingId) {
      contactId = existingId;
      wasDuplicate = true;
      console.log(
        '[' + requestId + '] Contact already exists (matched on ' + (meta.matchingField || 'unknown field') +
        '); reusing id ' + existingId + ' and attaching the note to it.'
      );
    } else {
      return res.status(502).json({
        ok: false,
        error: 'Your message could not be delivered. Please try again or email directly.',
        debug: DEBUG_ERRORS ? {
          status: contactResult.status,
          ghlError: ghlErrorMessage(contactResult),
          ghlBody: contactResult.raw
        } : undefined
      });
    }
  }

  /* The note carries the subject and message so the context survives even
     though GHL only stores name/email/phone/tags on the contact record. */
  let noteAdded = false;
  if (contactId) {
    const notePayload = {
      body: [
        'Website contact form submission',
        'Subject: ' + (subject || 'Not specified'),
        'Neighborhood: ' + (neighborhood || 'Not specified'),
        '',
        message
      ].join('\n')
    };
    const notePath = '/contacts/' + encodeURIComponent(contactId) + '/notes/';

    try {
      const noteResult = await ghlRequest(notePath, notePayload, token);
      logGhlResult('GHL create note on contact ' + contactId, requestId, noteResult, notePayload);
      noteAdded = noteResult.ok;
    } catch (err) {
      console.error(
        '[' + requestId + '] GHL note request threw before any response (POST ' + GHL_BASE + notePath + '):\n' +
        '  name: ' + err.name + '\n' +
        '  message: ' + err.message + '\n' +
        '  cause: ' + (err.cause ? (err.cause.code || err.cause.message || String(err.cause)) : 'none') + '\n' +
        '  stack: ' + err.stack
      );
    }
  } else {
    console.error(
      '[' + requestId + '] Contact created but no id found in the response; skipping note. ' +
      'Response body was: ' + contactResult.raw
    );
  }

  console.log(
    '[' + requestId + '] Submission complete. contactId=' + contactId +
    ' noteAdded=' + noteAdded + ' existingContact=' + wasDuplicate
  );

  /* A failed note does not fail the submission — the contact exists, and the
     message text is in the logs above for recovery. */
  return res.status(200).json({ ok: true, contactId: contactId, noteAdded: noteAdded });
};
