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

### Required Vercel environment variables
| Variable | What it is |
| --- | --- |
| `GHL_API_TOKEN` | GoHighLevel location API key (Settings → Business Info → API Key) |
| `GHL_LOCATION_ID` | GoHighLevel location/sub-account ID |

Optional: set `GHL_NEIGHBORHOOD_FIELD_ID` to a GHL custom field ID and the
neighborhood will also be written to that field.

**Never commit these values.** Set them in Vercel → Project → Settings →
Environment Variables, then redeploy so the function picks them up.

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
