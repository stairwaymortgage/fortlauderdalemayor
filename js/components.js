/* Shared header + footer for FortLauderdaleMayor.org.
   All markup AND styles for the disclaimer bar, nav, and footer live here.
   The CSS is injected into <head> at runtime so no separate stylesheet is needed. */

const sharedFonts = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">`;

const sharedCSS = `<style id="flm-shared-css">
/* Disclaimer bar */
.flm-disclaimer{background:#0a1628;color:#c9a84c;font-size:13px;line-height:1.5;text-align:center;padding:10px 40px}
.flm-disclaimer a{color:#c9a84c;text-decoration:underline}

/* Main nav */
.flm-nav{background:#ffffff;height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 40px;border-bottom:1px solid #e5e5e5;position:sticky;top:0;z-index:100}
.flm-brand{display:block;text-decoration:none;line-height:1.15}
.flm-brand-name{font-family:'Cormorant Garamond',Georgia,serif;font-weight:700;font-size:20px;color:#1a1a1a}
.flm-brand-tag{display:block;font-family:'DM Sans',sans-serif;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#c9a84c}
.flm-nav-links{display:flex;align-items:center;gap:28px}
.flm-nav-links a{font-family:'DM Sans',sans-serif;font-size:13px;color:#333333;text-decoration:none;transition:color 0.15s}
.flm-nav-links a:hover{color:#1a56db}
.flm-nav-links a.nav-active{background:#1a56db;color:#ffffff;padding:6px 14px;border-radius:4px}
.flm-nav-links a.nav-active:hover{color:#ffffff}
.flm-nav-toggle{display:none;background:none;border:none;color:#1a1a1a;font-size:22px;line-height:1;cursor:pointer;padding:6px}

/* Footer */
.flm-footer{background:#0a1628;padding:48px 40px}
.flm-footer-inner{max-width:760px;text-align:left}
.flm-footer-brand{font-family:'Cormorant Garamond',Georgia,serif;font-weight:700;font-size:20px;color:#ffffff;margin-bottom:14px}
.flm-footer-disclaimer{font-size:13px;color:rgba(255,255,255,0.6);line-height:1.8;max-width:580px;margin:0}
.flm-footer-links{display:flex;flex-wrap:wrap;gap:24px;margin-top:24px}
.flm-footer-links a{color:#c9a84c;font-size:13px;text-decoration:none}
.flm-footer-fine{font-size:11px;color:rgba(255,255,255,0.25);line-height:1.7;margin-top:24px}

@media(max-width:768px){
  .flm-nav{padding:0 20px}
  .flm-nav-links{display:none;position:absolute;top:64px;left:0;right:0;background:#ffffff;flex-direction:column;align-items:flex-start;gap:18px;padding:20px;border-bottom:1px solid #e5e5e5;box-shadow:0 8px 16px rgba(0,0,0,0.06)}
  .flm-nav-links.open{display:flex}
  .flm-nav-toggle{display:block}
  .flm-footer{padding:40px 24px}
}
</style>`;

const navHTML = `
<div class="flm-disclaimer">This is a personal civic project. It is not affiliated with the City of Fort Lauderdale or the Mayor's Office. <a href="/about">Read full disclosure</a></div>
<nav class="flm-nav">
  <a class="flm-brand" href="/">
    <span class="flm-brand-name">Fort Lauderdale Mayor</span>
    <span class="flm-brand-tag">A 14-Year Civic Project</span>
  </a>
  <button class="flm-nav-toggle" type="button" aria-label="Toggle navigation" aria-expanded="false">&#9776;</button>
  <div class="flm-nav-links" id="flm-nav-links">
    <a href="/five-issues">The Five Issues</a>
    <a href="/journey">The Journey</a>
    <a href="/blog">Blog</a>
    <a href="/about">About</a>
    <a href="/contact" class="nav-active">Contact</a>
  </div>
</nav>`;

const footerHTML = `
<footer class="flm-footer">
  <div class="flm-footer-inner">
    <div class="flm-footer-brand">Fort Lauderdale Mayor</div>
    <p class="flm-footer-disclaimer">This website is a personal civic project operated by Jim Blackburn, an independent Fort Lauderdale resident. It is not affiliated with, endorsed by, or connected to the City of Fort Lauderdale, the Mayor's Office, or any government agency. All views expressed are personal.</p>
    <div class="flm-footer-links">
      <a href="https://youtube.com" target="_blank" rel="noopener">YouTube</a>
      <a href="https://instagram.com" target="_blank" rel="noopener">Instagram</a>
      <a href="https://howtobecomemayor.com" target="_blank" rel="noopener">How To Become Mayor</a>
      <a href="/contact">Contact</a>
    </div>
    <div class="flm-footer-fine">&copy; 2026 FortLauderdaleMayor.org. Personal civic project by Jim Blackburn. Character Branding&reg; is a registered trademark.</div>
  </div>
</footer>`;

function loadComponents() {
  if (!document.getElementById('flm-shared-css')) {
    document.head.insertAdjacentHTML('beforeend', sharedFonts + sharedCSS);
  }
  const nav = document.getElementById('nav-placeholder');
  const footer = document.getElementById('footer-placeholder');
  if (nav) nav.innerHTML = navHTML;
  if (footer) footer.innerHTML = footerHTML;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadComponents);
} else {
  loadComponents();
}
