(function () {
  "use strict";

  var STORAGE_KEY = "theme";

  function getPreferredTheme() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "latte" || saved === "mocha") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "mocha" : "latte";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }
  function toggleTheme() {
    var current = document.documentElement.getAttribute("data-theme") || "latte";
    var next = current === "mocha" ? "latte" : "mocha";
    applyTheme(next);
  }

  // Apply theme immediately to prevent flash
  var initialTheme = getPreferredTheme();
  document.documentElement.setAttribute("data-theme", initialTheme);

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("theme-toggle");
    if (btn) btn.addEventListener("click", toggleTheme);

    updateContributionChart();
    initFadeAnimations();
  });

  // --- GitHub Contribution Chart ---
  function updateContributionChart() {
    var img = document.getElementById("contribution-chart");
    if (!img) return;
    img.src = "https://ghchart.rshah.org/fe640b/higorprado";
    img.alt = "GitHub contribution graph for higorprado";
  }

  // --- Fade-in on scroll ---
  function initFadeAnimations() {
    var elements = document.querySelectorAll(".fade-in");
    if (!elements.length) return;
    if (!("IntersectionObserver" in window)) {
      elements.forEach(function (el) { el.classList.add("visible"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    elements.forEach(function (el) { observer.observe(el); });
  }
})();
