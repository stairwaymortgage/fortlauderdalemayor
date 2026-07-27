# FortLauderdaleMayor.org — Vercel Deployment

## File Structure
```
/
├── index.html         ← Home — maps to /
├── about.html         ← About — maps to /about
├── blog.html          ← Blog — maps to /blog
├── contact.html       ← Contact — maps to /contact
├── five-issues.html   ← The Five Issues — maps to /five-issues
├── journey.html       ← The Journey — maps to /journey
├── api/
│   └── contact.js     ← Serverless function — sends contact form to GoHighLevel
├── js/
│   ├── components.js  ← Shared nav + footer — EDIT HERE to update all pages
│   └── main.js        ← Mobile nav, smooth scroll
├── vercel.json        ← Clean URL rewrites
└── README.md
```

---

## Contact Form → GoHighLevel

`contact.html` POSTs its fields as JSON to `/api/contact`, which creates the
contact in GHL and then attaches the subject + message as a note on that
contact. The page never redirects — it shows an inline success or error message.

Neighborhood and subject are stored as tags (`Neighborhood: …`, `Topic: …`)
alongside a `Website Contact Form` tag, so no custom field setup is required.

### API version

Uses the **GoHighLevel v2 API** at `https://services.leadconnectorhq.com` with a
Private Integration Token. Every request sends:

```
Authorization: Bearer <GHL_API_TOKEN>
Version: 2021-07-28
Content-Type: application/json
```

The `Version` header is **mandatory** — without it v2 returns
`401 {"message":"version header was not found."}` even with a valid token.

The token must have the **`contacts.write`** scope (add `contacts.readonly` too),
granted when the Private Integration is created in GHL.

### Required Vercel environment variables
| Variable | What it is |
| --- | --- |
| `GHL_API_TOKEN` | GoHighLevel **Private Integration Token**, starts with `pit-` (Settings → Private Integrations) |
| `GHL_LOCATION_ID` | GoHighLevel location/sub-account ID |

Optional:
- `GHL_NEIGHBORHOOD_FIELD_ID` — a GHL custom field ID; the neighborhood is also
  written to that field.
- `GHL_DEBUG_ERRORS` — set to `1` to include GHL's own error text in the API
  response (`debug` key) and log it to the browser console. Leave unset in
  normal operation.

**Never commit these values.** Set them in Vercel → Project → Settings →
Environment Variables, then redeploy so the function picks them up.

### Debugging "Your message could not be delivered"

That message means GHL rejected the contact create. Open **Vercel → Project →
Logs**, submit the form, and find the `GHL create contact` block. Every
submission gets a short request id (e.g. `[kp6e7x]`) so its lines group
together, and the block prints the status, the response headers, the **full raw
GHL response body**, and the payload that was sent.

Common responses:

| GHL response | Meaning | Fix |
| --- | --- | --- |
| `401 {"message":"Invalid Private Integration token"}` | `GHL_API_TOKEN` is wrong, revoked, or from another location | Re-copy the token from Settings → Private Integrations and redeploy |
| `401 {"message":"version header was not found."}` | The `Version` header is missing | Should not happen — check `GHL_API_VERSION` in `api/contact.js` |
| `401 {"msg":"Api key is invalid."}` | A **v1** response — the request went to the old host | Confirm `GHL_BASE` is `https://services.leadconnectorhq.com` |
| `403` | Token lacks the required scope | Add `contacts.write` to the Private Integration |
| `400` / `422` | Payload validation error | The logged response body names the offending field |
| `404` | Wrong path for this API version | Check `GHL_BASE` in `api/contact.js` |

If the log says `WRONG TOKEN TYPE`, the token is a v1 location API key (a JWT)
rather than a `pit-` token; the v2 host will always reject it.

### Repeat submissions

v2 refuses to create a contact whose email already exists, returning
`400 "This location does not allow duplicated contacts."` with the existing id in
`meta.contactId`. The function reuses that id and attaches the note to the
existing contact, so someone writing in a second time still gets through. The log
line reads `existingContact=true`. Note that tags are only applied on first
creation.

The function normalizes `GHL_API_TOKEN` before use — a pasted `Bearer ` prefix,
surrounding quotes, or a trailing newline are stripped, and the log says so.
The token itself is never logged; only its length and shape.

---

## Deploy to Vercel

### Option 1 — Drag & Drop
1. Go to vercel.com → New Project
2. Drag this entire folder into the upload area
3. No build command needed — static site
4. Click Deploy

### Option 2 — Vercel CLI
```bash
npm install -g vercel
cd /path/to/this/folder
vercel
```

---

## How to Update Header / Footer

Open `js/components.js`. You will find two template literals:

- `navHTML` — the full navigation including ticker bar
- `footerHTML` — the footer

**Edit once → updates every page automatically.**

### To update ticker bar cities:
Find `.fomo-ticker` inside `navHTML` and edit the `<span>` tags.

### To add a nav link:
Find `.nav-links` inside `navHTML` and add:
```html
<a href="/your-page">Label</a>
```
Then add the new page HTML file + a rewrite in `vercel.json`.

---

## How to Add a New Page

1. Create `your-page.html` in root folder
2. Add these to `<body>`:
```html
<div id="nav-placeholder"></div>
<!-- your content -->
<div id="footer-placeholder"></div>
<script src="/js/components.js"></script>
<script src="/js/main.js"></script>
```
3. Add rewrite to `vercel.json`:
```json
{ "source": "/your-page", "destination": "/your-page.html" }
```
4. Redeploy

---

## Site Info
- **Site Title:** Fort Lauderdale Mayor
- **Tagline:** Jim Blackburn's Public Journey to Become Mayor of Fort Lauderdale by 2040
- **Colors:** Navy #0a1628 | Gold #c9a84c | Red ticker #c0392b
- **Fonts:** Cormorant Garamond (headings) | DM Sans (body)

*Character Branding® — Jim Blackburn 2026*
