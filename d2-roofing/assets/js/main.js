// D2 Roofing & Construction — shared site behaviour (mobile nav toggle)
(function () {
  'use strict';

  var toggle = document.querySelector('[data-nav-toggle]');
  var panel = document.querySelector('[data-nav-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var isOpen = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      panel.hidden = !isOpen;
    });
    // Close the mobile panel when a link inside it is followed
    panel.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        panel.classList.remove('is-open');
        panel.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
})();
