// mava.js — Mava web chat (docs.kleros.io)
// Role: human escalation only. Mintlify Assistant handles AI answers.
(function () {
  var SCRIPT_ID = "MavaWebChat";
  if (document.getElementById(SCRIPT_ID)) return;

  var s = document.createElement("script");
  s.id = SCRIPT_ID;
  s.src = "https://widget.mava.app";
  s.async = true;
  s.setAttribute("widget-version", "v2");
  s.setAttribute("enable-sdk", "true");
  s.setAttribute("data-token", "07246e2b5929ba3b898d6126e4fe0674f9e3a90aa9aace7d73204a328c624b46");
  document.head.appendChild(s);

  // Route Mintlify's "Contact support" button (in the Ask AI panel)
  // into the Mava widget instead of a mailto link.
  document.addEventListener(
    "click",
    function (e) {
      var btn = e.target.closest('[data-component-part="contact-support-button"]');
      if (!btn) return;
      var launcher = document.getElementById("mava-webchat-launcher");
      if (!launcher) return; // widget not ready — let the default link happen
      e.preventDefault();
      launcher.click();
    },
    true
  );
})();
