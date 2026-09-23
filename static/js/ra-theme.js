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
    // Migrate legacy FinappDarkmode if ra-theme unset
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
    var icon = btn.querySelector("ion-icon");
    var emoji = btn.querySelector(".ra-theme-emoji");
    if (icon) {
      icon.setAttribute("name", theme === "dark" ? "sunny-outline" : "moon-outline");
    } else if (emoji) {
      emoji.textContent = theme === "dark" ? "☀" : "☾";
    } else if (!btn.querySelector("img")) {
      /* leave custom markup */
    }
    btn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    btn.title = theme === "dark" ? "Light mode" : "Dark mode";
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
    if (persist !== false) {
      try {
        localStorage.setItem(KEY, theme);
        localStorage.setItem(FIN, theme === "dark" ? "1" : "0");
      } catch (e) {}
    } else {
      // Keep FinappDarkmode aligned even on FOUC apply
      try { localStorage.setItem(FIN, theme === "dark" ? "1" : "0"); } catch (e) {}
    }
    setIcon(theme);
    var sw = document.getElementById("darkmodeSwitch");
    if (sw) sw.checked = theme === "dark";
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
      btn.className = "headerButton ra-theme-toggle";
      btn.innerHTML = '<ion-icon name="sunny-outline"></ion-icon>';
      var right = document.querySelector(".appHeader .right");
      if (right) {
        right.insertBefore(btn, right.firstChild);
      } else {
        btn.classList.add("ra-theme-fab");
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
        if (!btn.querySelector("ion-icon") && !btn.querySelector(".ra-theme-emoji")) {
          btn.innerHTML = '<span class="ra-theme-emoji">☀</span>';
        }
      }
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
        // Prefer our source of truth after legacy toggle mutates FinappDarkmode
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
    apply(getTheme(), true);
  }

  // Early apply helper (also used if script loads late)
  apply(getTheme(), false);

  global.RATheme = {
    KEY: KEY,
    FIN: FIN,
    get: getTheme,
    apply: apply,
    toggle: toggle,
    init: init,
    ensureBtn: ensureBtn
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);
