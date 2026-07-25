/* Behavior for the shared nav injected by components.js:
   active-link highlighting, the mobile hamburger menu, and smooth anchor scrolling.
   Loaded after components.js, so the nav markup is already in the DOM. */

/* "/five-issues.html", "/five-issues/" and "/five-issues" all normalize to "/five-issues"
   so the highlight works on Vercel's clean URLs and on a plain local file server alike. */
function flmNormalizePath(pathname) {
  var p = pathname.replace(/\/index\.html$/i, '/').replace(/\.html$/i, '');
  if (p.length > 1 && p.charAt(p.length - 1) === '/') p = p.slice(0, -1);
  return p === '' ? '/' : p;
}

function flmHighlightActiveLink() {
  var links = document.querySelectorAll('.flm-nav-links a');
  if (!links.length) return;
  var current = flmNormalizePath(window.location.pathname);
  Array.prototype.forEach.call(links, function (a) {
    a.classList.remove('nav-active');
    a.removeAttribute('aria-current');
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#') return;
    var linkPath = flmNormalizePath(new URL(href, window.location.origin).pathname);
    if (linkPath !== '/' && linkPath === current) {
      a.classList.add('nav-active');
      a.setAttribute('aria-current', 'page');
    }
  });
}

function flmInitMobileMenu() {
  var toggle = document.querySelector('.flm-nav-toggle');
  var links = document.getElementById('flm-nav-links');
  if (!toggle || !links) return;

  function close() {
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  Array.prototype.forEach.call(links.querySelectorAll('a'), function (a) {
    a.addEventListener('click', close);
  });

  document.addEventListener('click', function (e) {
    if (!links.contains(e.target) && !toggle.contains(e.target)) close();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 768) close();
  });
}

function flmInitSmoothScroll() {
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var hash = a.getAttribute('href');
    if (!hash || hash.length < 2) return;
    var target = document.querySelector(hash);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function flmInit() {
  flmHighlightActiveLink();
  flmInitMobileMenu();
  flmInitSmoothScroll();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', flmInit);
} else {
  flmInit();
}
