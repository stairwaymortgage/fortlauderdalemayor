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
├── js/
│   ├── components.js  ← Shared nav + footer — EDIT HERE to update all pages
│   └── main.js        ← Mobile nav, smooth scroll
├── vercel.json        ← Clean URL rewrites
└── README.md
```

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
