/* Behavior for the shared nav injected by components.js:
   active-link highlighting, the mobile hamburger menu, and smooth anchor scrolling.
   Runs after components.js, so the nav is already in the DOM. */

function flmNormalizePath(pathname) {
  let p = pathname.replace(/\/index\.html$/i, '/').replace(/\.html$/i, '');
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p === '' ? '/' : p;
}

function flmHighlightActiveLink() {
  const links = document.querySelectorAll('.flm-nav-links a');
  if (!links.length) return;
  const current = flmNormalizePath(window.location.pathname);
  links.forEach(function (a) {
    a.classList.remove('nav-active');
    const linkPath = flmNormalizePath(new URL(a.getAttribute('href'), window.location.origin).pathname);
    if (linkPath !== '/' && linkPath === current) {
      a.classList.add('nav-active');
    }
  });
}

function flmInitMobileMenu() {
  const toggle = document.querySelector('.flm-nav-toggle');
  const links = document.getElementById('flm-nav-links');
  if (!toggle || !links) return;

  function close() {
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', close);
  });

  document.addEventListener('click', function (e) {
    if (!links.contains(e.target) && !toggle.contains(e.target)) close();
  });
}

function flmInitSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      const hash = this.getAttribute('href');
      if (!hash || hash.length < 2) return;
      const target = document.querySelector(hash);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
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
