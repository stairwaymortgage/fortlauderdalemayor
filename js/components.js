/* Shared header + footer for FortLauderdaleMayor.org.
   All markup AND styles for the disclaimer bar, nav, and footer live here.
   Fonts and CSS are injected into <head> at runtime so no separate stylesheet is needed. */

var flmFonts = '' +
  '<link rel="preconnect" href="https://fonts.googleapis.com">' +
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">';

var flmCSS = '<style id="flm-shared-css">' + [
  ':root{--navy:#0a1628;--gold:#c9a84c;--white:#ffffff;--text:#1a1a1a}',

  /* Top disclaimer bar */
  '.flm-disclaimer{background:var(--navy);color:var(--gold);font-family:"DM Sans",sans-serif;font-size:12px;font-weight:400;line-height:1.6;text-align:center;padding:10px 24px;letter-spacing:0.02em}',
  '.flm-disclaimer a{color:var(--gold);text-decoration:underline}',

  /* Main nav */
  '.flm-nav{background:var(--white);display:flex;align-items:center;justify-content:space-between;gap:24px;padding:14px 40px;border-bottom:1px solid #e5e5e5;position:sticky;top:0;z-index:100}',
  '.flm-brand{display:block;text-decoration:none;line-height:1.15}',
  '.flm-brand-name{display:block;font-family:"Cormorant Garamond",Georgia,serif;font-weight:700;font-size:21px;color:var(--text)}',
  '.flm-brand-tag{display:block;font-family:"DM Sans",sans-serif;font-size:10px;font-weight:500;letter-spacing:0.14em;text-transform:uppercase;color:var(--gold)}',
  '.flm-nav-links{display:flex;align-items:center;gap:28px}',
  '.flm-nav-links a{font-family:"DM Sans",sans-serif;font-size:13px;font-weight:400;color:var(--text);text-decoration:none;letter-spacing:0.02em;padding-bottom:2px;border-bottom:2px solid transparent;transition:color 0.15s,border-color 0.15s}',
  '.flm-nav-links a:hover{color:var(--gold)}',
  '.flm-nav-links a.nav-active{color:var(--gold);font-weight:500;border-bottom-color:var(--gold)}',
  '.flm-nav-toggle{display:none;background:none;border:none;color:var(--text);font-size:22px;line-height:1;cursor:pointer;padding:6px}',

  /* Footer */
  '.flm-footer{background:var(--navy);font-family:"DM Sans",sans-serif;padding:48px 40px 36px}',
  '.flm-footer-inner{max-width:760px}',
  '.flm-footer-brand{font-family:"Cormorant Garamond",Georgia,serif;font-weight:700;font-size:21px;color:var(--white);margin-bottom:14px}',
  '.flm-footer-disclaimer{font-size:13px;font-weight:400;color:rgba(255,255,255,0.6);line-height:1.8;max-width:600px;margin:0}',
  '.flm-footer-links{display:flex;flex-wrap:wrap;gap:24px;margin-top:24px}',
  '.flm-footer-links a{color:var(--gold);font-size:13px;font-weight:500;text-decoration:none}',
  '.flm-footer-links a:hover{text-decoration:underline}',
  '.flm-footer-fine{font-size:11px;font-weight:400;color:rgba(255,255,255,0.28);line-height:1.7;margin-top:26px}',

  /* Mobile: nav collapses behind the hamburger below 768px */
  '@media(max-width:768px){',
  '.flm-nav{padding:14px 20px;flex-wrap:wrap}',
  '.flm-nav-toggle{display:block}',
  '.flm-nav-links{display:none;flex-direction:column;align-items:flex-start;gap:18px;width:100%;padding:20px 0 6px}',
  '.flm-nav-links.open{display:flex}',
  '.flm-footer{padding:40px 24px 32px}',
  '}'
].join('') + '</style>';

var flmNavHTML = [
  '<div class="flm-disclaimer">This is a personal civic project. It is not affiliated with the City of Fort Lauderdale or the Mayor\'s Office. <a href="/about">Read full disclosure</a></div>',
  '<nav class="flm-nav">',
  '  <a class="flm-brand" href="/">',
  '    <span class="flm-brand-name">Fort Lauderdale Mayor</span>',
  '    <span class="flm-brand-tag">A 14-Year Civic Project</span>',
  '  </a>',
  '  <button class="flm-nav-toggle" type="button" aria-label="Toggle navigation" aria-expanded="false" aria-controls="flm-nav-links">&#9776;</button>',
  '  <div class="flm-nav-links" id="flm-nav-links">',
  '    <a href="/five-issues">The Five Issues</a>',
  '    <a href="/journey">The Journey</a>',
  '    <a href="/blog">Blog</a>',
  '    <a href="/about">About</a>',
  '    <a href="/contact">Contact</a>',
  '  </div>',
  '</nav>'
].join('\n');

var flmFooterHTML = [
  '<footer class="flm-footer">',
  '  <div class="flm-footer-inner">',
  '    <div class="flm-footer-brand">Fort Lauderdale Mayor</div>',
  '    <p class="flm-footer-disclaimer">This website is a personal civic project operated by Jim Blackburn, an independent Fort Lauderdale resident. It is not affiliated with, endorsed by, or connected to the City of Fort Lauderdale, the Mayor\'s Office, or any government agency. All views expressed are personal.</p>',
  '    <div class="flm-footer-links">',
  '      <a href="https://youtube.com" target="_blank" rel="noopener">YouTube</a>',
  '      <a href="https://instagram.com" target="_blank" rel="noopener">Instagram</a>',
  '      <a href="/contact">Contact</a>',
  '    </div>',
  '    <div class="flm-footer-fine">&copy; 2026 FortLauderdaleMayor.org. Personal civic project by Jim Blackburn. Character Branding&reg; is a registered trademark.</div>',
  '  </div>',
  '</footer>'
].join('\n');

function flmLoadComponents() {
  if (!document.getElementById('flm-shared-css')) {
    document.head.insertAdjacentHTML('beforeend', flmFonts + flmCSS);
  }
  var nav = document.getElementById('nav-placeholder');
  var footer = document.getElementById('footer-placeholder');
  if (nav) nav.innerHTML = flmNavHTML;
  if (footer) footer.innerHTML = flmFooterHTML;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', flmLoadComponents);
} else {
  flmLoadComponents();
}
