/* Shared site-wide theme: ra-theme ("light"|"dark") + FinappDarkmode ("0"|"1").
   No time-based auto once a preference exists; missing -> light. */
(function (global) {
  var KEY = "ra-theme";
  var FIN = "FinappDarkmode";

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function getTheme() {
    var t = stored();
    if (t === "light" || t === "dark") return t;
    try {
      var f = localStorage.getItem(FIN);
      if (f === "1") return "dark";
      if (f === "0") return "light";
    } catch (e) {}
    return "light";
  }

  function setIcon(theme) {
    var btn = document.getElementById("raThemeToggle");
    if (!btn) return;
    var emoji = btn.querySelector(".ra-theme-emoji");
    if (!emoji) {
      emoji = document.createElement("span");
      emoji.className = "ra-theme-emoji";
      emoji.setAttribute("aria-hidden", "true");
      btn.insertBefore(emoji, btn.firstChild);
    }
    emoji.textContent = theme === "dark" ? "☀" : "☾";
    var icon = btn.querySelector("ion-icon");
    if (icon) {
      icon.setAttribute("name", theme === "dark" ? "sunny-outline" : "moon-outline");
      icon.style.display = "none";
    }
    btn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    btn.title = theme === "dark" ? "Light mode" : "Dark mode";
  }


  function disableTiltEnvironment() {
    try {
      var coarse = false;
      try {
        coarse = window.matchMedia && (
          window.matchMedia('(hover: none)').matches ||
          window.matchMedia('(pointer: coarse)').matches
        );
      } catch (e) {}
      var touch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      if (coarse || touch || getTheme() === 'light') {
        document.documentElement.classList.add('ra-no-tilt');
      } else {
        document.documentElement.classList.remove('ra-no-tilt');
      }
    } catch (e) {}
  }

  function clearTiltTransforms() {
    try {
      ["login-card", "reg-card", "logout-card", "wordmark"].forEach(function (id) {
        var el = document.getElementById(id);
        if (el && el.style) {
          el.style.transform = "none";
          el.style.removeProperty("transform");
        }
      });
      document.querySelectorAll(".card, .btn, .btn-row, .brand-wordmark").forEach(function (el) {
        if (el && el.style && el.style.transform) {
          el.style.transform = "none";
          el.style.removeProperty("transform");
        }
      });
    } catch (e) {}
  }

  function apply(theme, persist) {
    if (theme !== "light" && theme !== "dark") theme = "light";
    var root = document.documentElement;
    var body = document.body;
    if (theme === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
      if (body) body.classList.remove("dark-mode");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
      if (body) body.classList.add("dark-mode");
    }
    try { root.setAttribute("data-ra-theme", theme); } catch (e) {}
    if (persist !== false) {
      try {
        localStorage.setItem(KEY, theme);
        localStorage.setItem(FIN, theme === "dark" ? "1" : "0");
      } catch (e) {}
    } else {
      try { localStorage.setItem(FIN, theme === "dark" ? "1" : "0"); } catch (e) {}
    }
    setIcon(theme);
    var sw = document.getElementById("darkmodeSwitch");
    if (sw) sw.checked = theme === "dark";
    /* Always clear 3D tilt so light float never inherits a shrunk projection */
    disableTiltEnvironment();
    clearTiltTransforms();
    /* Light: kill transforms again next frames (pointermove may re-apply same tick) */
    if (theme === "light") {
      try {
        requestAnimationFrame(clearTiltTransforms);
        setTimeout(clearTiltTransforms, 50);
        setTimeout(clearTiltTransforms, 200);
      } catch (e) {}
    }
    try {
      global.dispatchEvent(new CustomEvent("ra-theme-change", { detail: { theme: theme } }));
    } catch (e) {}
    return theme;
  }

  function toggle(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    return apply(getTheme() === "dark" ? "light" : "dark", true);
  }

  function ensureBtn() {
    var btn = document.getElementById("raThemeToggle");
    if (!btn) {
      btn = document.createElement("button");
      btn.id = "raThemeToggle";
      btn.type = "button";
      btn.className = "headerButton ra-theme-toggle ra-theme-fab";
      btn.innerHTML = '<span class="ra-theme-emoji" aria-hidden="true">☀</span>';
      btn.style.cssText = "position:fixed;top:max(12px,env(safe-area-inset-top));right:12px;z-index:10001;width:42px;height:42px;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;pointer-events:auto;";
      var right = document.querySelector(".appHeader .right");
      if (right) {
        btn.classList.remove("ra-theme-fab");
        right.insertBefore(btn, right.firstChild);
      } else {
        (document.body || document.documentElement).appendChild(btn);
      }
    } else {
      var header = btn.closest && btn.closest(".appHeader");
      var hidden = false;
      if (header) {
        var st = (header.getAttribute("style") || "").replace(/\s/g, "").toLowerCase();
        if (st.indexOf("display:none") !== -1) hidden = true;
        try {
          if (window.getComputedStyle && getComputedStyle(header).display === "none") hidden = true;
        } catch (e) {}
      }
      if (header && !hidden) btn.classList.remove("ra-theme-fab");
      if (!header || hidden) {
        btn.classList.add("ra-theme-fab");
        if (btn.parentNode !== document.body && document.body) document.body.appendChild(btn);
        btn.style.zIndex = "10001";
        btn.style.pointerEvents = "auto";
      }
      if (!btn.querySelector(".ra-theme-emoji")) {
        var span = document.createElement("span");
        span.className = "ra-theme-emoji";
        span.setAttribute("aria-hidden", "true");
        span.textContent = "☀";
        btn.insertBefore(span, btn.firstChild);
      }
      var ion = btn.querySelector("ion-icon");
      if (ion) ion.style.display = "none";
    }
    if (!btn._raBound) {
      btn._raBound = 1;
      btn.addEventListener("click", toggle);
    }
    return btn;
  }

  function bindSwitch() {
    var sw = document.getElementById("darkmodeSwitch");
    if (!sw || sw._raBound) return;
    sw._raBound = 1;
    sw.addEventListener("click", function () {
      setTimeout(function () {
        var f;
        try { f = localStorage.getItem(FIN); } catch (e) { f = null; }
        if (f === "1" || f === "0") {
          apply(f === "1" ? "dark" : "light", true);
        } else {
          apply(document.body && document.body.classList.contains("dark-mode") ? "dark" : "light", true);
        }
      }, 0);
    });
  }

  function init() {
    ensureBtn();
    bindSwitch();
    disableTiltEnvironment();
    apply(getTheme(), true);
  }

  apply(getTheme(), false);

  global.RATheme = {
    KEY: KEY,
    FIN: FIN,
    get: getTheme,
    apply: apply,
    toggle: toggle,
    init: init,
    ensureBtn: ensureBtn,
    clearTilt: clearTiltTransforms,
    disableTilt: disableTiltEnvironment,
    isLight: function () { return getTheme() === "light"; }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  try {
    global.addEventListener("storage", function (e) {
      if (!e) return;
      if (e.key === KEY || e.key === FIN) {
        apply(getTheme(), false);
      }
    });
  } catch (e) {}
  try {
    global.addEventListener("pageshow", function () {
      apply(getTheme(), false);
      ensureBtn();
      setIcon(getTheme());
    });
  } catch (e) {}
})(window);
