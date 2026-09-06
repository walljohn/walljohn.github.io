// D2 Roofing & Construction — Estimate request form handling.
//
// Submits to Formspree (https://formspree.io). Formspree requires a free
// account and a form endpoint ID; until FORM_ENDPOINT below is replaced
// with a real ID, the form will not pretend to succeed — see the
// "not connected" branch below and /notes/SETUP.md for the two-minute setup.
(function () {
  'use strict';

  // TODO(owner): replace with your real Formspree endpoint, e.g.
  // 'https://formspree.io/f/abcdwxyz'. See notes/SETUP.md.
  var FORM_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';
  var MAX_FILE_MB = 8;
  var MAX_FILES = 3;

  var forms = document.querySelectorAll('[data-estimate-form]');
  forms.forEach(initForm);

  function initForm(form) {
    var status = form.querySelector('[data-form-status]');
    var submitBtn = form.querySelector('[data-submit-btn]');
    var submitLabel = submitBtn ? submitBtn.querySelector('[data-submit-label]') : null;
    var fileInput = form.querySelector('input[type="file"]');
    var fileList = form.querySelector('[data-file-list]');

    if (fileInput) {
      fileInput.addEventListener('change', function () {
        validateFiles(fileInput, fileList, status);
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors(form);
      hideStatus(status);

      var valid = validateRequiredFields(form);
      if (fileInput && fileInput.files.length && !validateFiles(fileInput, fileList, status)) {
        valid = false;
      }
      if (!valid) {
        showStatus(status, 'error', 'Please fix the highlighted fields and try again.');
        var firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      if (!FORM_ENDPOINT || FORM_ENDPOINT.indexOf('YOUR_FORM_ID') !== -1) {
        showStatus(
          status,
          'info',
          'This form is built and validated, but not yet connected to a live inbox. ' +
          'The site owner needs to add a Formspree endpoint (see notes/SETUP.md) before ' +
          'submissions will be delivered. In the meantime, please call (613) 483-4070.'
        );
        return;
      }

      setLoading(true);
      var data = new FormData(form);

      fetch(FORM_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      })
        .then(function (response) {
          if (response.ok) {
            form.reset();
            if (fileList) fileList.textContent = '';
            showStatus(status, 'success', "Thanks — your request has been sent. We'll follow up as soon as possible.");
          } else {
            return response.json().then(function (body) {
              var message = (body && body.errors && body.errors.length)
                ? body.errors.map(function (er) { return er.message; }).join(' ')
                : 'Something went wrong sending your request.';
              throw new Error(message);
            });
          }
        })
        .catch(function () {
          showStatus(
            status,
            'error',
            "We couldn't send your request — please try again, or call us directly at (613) 483-4070."
          );
        })
        .finally(function () {
          setLoading(false);
        });
    });

    function setLoading(isLoading) {
      if (!submitBtn) return;
      submitBtn.disabled = isLoading;
      submitBtn.querySelector('[data-spinner]').hidden = !isLoading;
      if (submitLabel) submitLabel.textContent = isLoading ? 'Sending…' : 'Request My Free Estimate';
    }
  }

  function validateRequiredFields(form) {
    var valid = true;
    var fields = form.querySelectorAll('[data-required]');
    fields.forEach(function (field) {
      var value = (field.value || '').trim();
      var ok = value.length > 0;

      if (ok && field.type === 'email') {
        ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      }
      if (ok && field.hasAttribute('data-phone')) {
        var digits = value.replace(/\D/g, '');
        ok = digits.length >= 10;
      }

      setFieldValidity(field, ok);
      if (!ok) valid = false;
    });
    return valid;
  }

  function setFieldValidity(field, ok) {
    var errorEl = document.getElementById(field.getAttribute('aria-describedby'));
    field.setAttribute('aria-invalid', ok ? 'false' : 'true');
    if (errorEl) errorEl.classList.toggle('is-visible', !ok);
  }

  function clearErrors(form) {
    form.querySelectorAll('[aria-invalid]').forEach(function (field) {
      field.setAttribute('aria-invalid', 'false');
    });
    form.querySelectorAll('.field-error').forEach(function (el) {
      el.classList.remove('is-visible');
    });
  }

  function validateFiles(fileInput, fileList, status) {
    var files = Array.prototype.slice.call(fileInput.files);
    var ok = true;
    var messages = [];

    if (files.length > MAX_FILES) {
      ok = false;
      messages.push('Please attach no more than ' + MAX_FILES + ' photos.');
    }
    files.forEach(function (file) {
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        ok = false;
        messages.push('"' + file.name + '" is over the ' + MAX_FILE_MB + ' MB limit.');
      }
    });

    if (fileList) {
      fileList.textContent = files.length
        ? files.map(function (f) { return f.name + ' (' + (f.size / (1024 * 1024)).toFixed(1) + ' MB)'; }).join(', ')
        : '';
    }

    if (!ok && status) {
      showStatus(status, 'error', messages.join(' '));
    }
    return ok;
  }

  function showStatus(status, kind, message) {
    if (!status) return;
    status.className = 'form-status is-visible status-' + kind;
    status.textContent = message;
    status.setAttribute('role', kind === 'error' ? 'alert' : 'status');
  }

  function hideStatus(status) {
    if (!status) return;
    status.className = 'form-status';
    status.textContent = '';
  }
})();
