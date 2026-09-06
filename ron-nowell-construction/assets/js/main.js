(function () {
  "use strict";

  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("primaryNav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  var form = document.getElementById("estimateForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var name = (data.get("name") || "").toString().trim();
      var email = (data.get("email") || "").toString().trim();
      var phone = (data.get("phone") || "").toString().trim();
      var service = (data.get("service") || "Not specified").toString().trim();
      var location = (data.get("location") || "").toString().trim();
      var description = (data.get("description") || "").toString().trim();

      var status = document.getElementById("formStatus");

      if (!name || !email || !location || !description) {
        status.textContent = "Please fill in name, email, project location, and description before sending.";
        status.className = "form-status visible";
        return;
      }

      var subject = "Estimate request: " + service + " - " + name;
      var bodyLines = [
        "Name: " + name,
        "Email: " + email,
        "Phone: " + (phone || "(not provided)"),
        "Service: " + service,
        "Project location: " + location,
        "",
        "Description:",
        description
      ];
      var mailto = "mailto:rye440@hotmail.com" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(bodyLines.join("\n"));

      window.location.href = mailto;

      status.textContent = "Your email app should be opening now with these details addressed to Ryan. Nothing has been sent yet - press send there to deliver it.";
      status.className = "form-status visible ok";
    });
  }
})();
