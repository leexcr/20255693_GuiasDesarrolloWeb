// =========================================================
// D'Coratelas — shared behaviour across the 3 pages
// =========================================================

document.addEventListener('DOMContentLoaded', function () {

  /* ---- Header: solid once the page scrolls past the hero ---- */
  var header = document.getElementById('siteHeader');
  var hasHero = document.querySelector('.hero, .page-hero');

  function onScroll() {
    if (!header) return;
    var threshold = header.classList.contains('on-dark') ? 60 : 4;
    header.classList.toggle('is-solid', window.scrollY > threshold);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Mobile nav toggle ---- */
  var toggle = document.getElementById('navToggle');
  var mobileNav = document.getElementById('mobileNav');
  var mobileClose = document.getElementById('mobileClose');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.add('is-open');
    });
  }
  if (mobileClose && mobileNav) {
    mobileClose.addEventListener('click', function () {
      mobileNav.classList.remove('is-open');
    });
  }

  /* ---- Reveal-on-scroll for catalog spreads / cards ----
     Respects the --anim-duration / --anim-easing tokens defined
     in css/styles.css, and staggers siblings using --anim-stagger. */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = el.dataset.revealDelay || 0;
          setTimeout(function () {
            el.classList.add('is-visible');
          }, Number(delay));
          io.unobserve(el);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach(function (el, i) {
      // stagger cards that share the same parent grid
      var group = el.closest('.card-grid, .triptych');
      if (group) {
        var siblings = Array.prototype.slice.call(group.children);
        var index = siblings.indexOf(el);
        el.dataset.revealDelay = index * 90;
      }
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---- Contact form -> prefilled WhatsApp message ---- */
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var nombre = form.nombre.value.trim();
      var telefono = form.telefono.value.trim();
      var categoria = form.categoria.value;
      var mensaje = form.mensaje.value.trim();

      var lines = [
        'Hola D\'Coratelas, soy ' + (nombre || 'una clienta interesada') + '.',
        categoria ? 'Me interesa la categoría: ' + categoria + '.' : '',
        mensaje ? mensaje : '',
        telefono ? 'Mi teléfono/WhatsApp: ' + telefono : ''
      ].filter(Boolean).join('\n');

      var url = 'https://wa.me/50376545351?text=' + encodeURIComponent(lines);
      window.open(url, '_blank', 'noopener');
    });
  }

});
