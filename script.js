(function () {
  "use strict";

  // --- Theme Toggle ---
  var STORAGE_KEY = "theme";

  function getPreferredTheme() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "latte" || saved === "mocha") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "mocha" : "latte";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
    restyleContributionChart(theme);
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute("data-theme") || "latte";
    var next = current === "mocha" ? "latte" : "mocha";
    applyTheme(next);
  }

  // Apply theme immediately to prevent flash
  var initialTheme = getPreferredTheme();
  document.documentElement.setAttribute("data-theme", initialTheme);

  // Bind toggle after DOM ready
  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("theme-toggle");
    if (btn) btn.addEventListener("click", toggleTheme);

    loadContributionChart(initialTheme);
    initFadeAnimations();
  });

  // --- GitHub Contribution Chart (2026 only, custom styled) ---
  // Fetch the SVG from ghchart, extract only 2026 rects, rebuild a clean chart.
  function loadContributionChart(theme) {
    var container = document.getElementById("contribution-chart");
    if (!container) return;

    var color = theme === "mocha" ? "cba6f7" : "8839ef";
    var url = "https://ghchart.rshah.org/" + color + "/higorprado";

    fetch(url)
      .then(function (res) { return res.text(); })
      .then(function (svgText) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(svgText, "image/svg+xml");
        var rects = doc.querySelectorAll("rect[data-date]");

        // Filter to 2026 only
        var yearRects = [];
        for (var i = 0; i < rects.length; i++) {
          if (rects[i].getAttribute("data-date").startsWith("2026")) {
            yearRects.push(rects[i]);
          }
        }

        if (yearRects.length === 0) {
          container.innerHTML = '<p style="color:var(--ctp-subtext0);font-size:0.85rem;">No 2026 activity yet.</p>';
          return;
        }

        // Build a clean SVG with repositioned rects
        var cellSize = 11;
        var cellGap = 3;
        var cellStep = cellSize + cellGap;
        // 7 rows (Sun-Sat), N columns (weeks)
        // Calculate week columns from the data
        var weeks = {};
        for (var j = 0; j < yearRects.length; j++) {
          var r = yearRects[j];
          var dateStr = r.getAttribute("data-date");
          var d = new Date(dateStr + "T00:00:00Z");
          var dayOfWeek = d.getUTCDay(); // 0=Sun
          // Week number since start of year
          var startOfYear = new Date("2026-01-01T00:00:00Z");
          var dayOfYear = Math.floor((d - startOfYear) / 86400000);
          var week = Math.floor(dayOfYear / 7);
          if (!weeks[week]) weeks[week] = {};
          weeks[week][dayOfWeek] = r;
        }

        var weekKeys = Object.keys(weeks).map(Number).sort(function (a, b) { return a - b; });
        var totalWeeks = weekKeys.length;
        var svgWidth = totalWeeks * cellStep + 2;
        var svgHeight = 7 * cellStep + 2;

        var emptyFill = theme === "mocha" ? "#313244" : "#ccd0da";

        var svgParts = ['<svg xmlns="http://www.w3.org/2000/svg" width="' + svgWidth + '" height="' + svgHeight + '" viewBox="0 0 ' + svgWidth + ' ' + svgHeight + '">'];

        for (var w = 0; w < totalWeeks; w++) {
          var wk = weekKeys[w];
          for (var day = 0; day < 7; day++) {
            var x = w * cellStep + 1;
            var y = day * cellStep + 1;
            var rect = weeks[wk] && weeks[wk][day];
            if (rect) {
              var score = parseInt(rect.getAttribute("data-score") || "0", 10);
              var fill = score === 0 ? emptyFill : rect.getAttribute("style").match(/fill:([^;]+)/)[1];
              svgParts.push('<rect x="' + x + '" y="' + y + '" width="' + cellSize + '" height="' + cellSize + '" rx="2" fill="' + fill + '" data-score="' + score + '" data-date="' + rect.getAttribute("data-date") + '"/>');
            } else {
              svgParts.push('<rect x="' + x + '" y="' + y + '" width="' + cellSize + '" height="' + cellSize + '" rx="2" fill="' + emptyFill + '"/>');
            }
          }
        }

        svgParts.push("</svg>");
        container.innerHTML = svgParts.join("");
      })
      .catch(function () {
        container.innerHTML = '<p style="color:var(--ctp-subtext0);font-size:0.85rem;">Could not load contribution graph. <a href="https://github.com/higorprado" style="color:var(--ctp-blue)">View on GitHub</a>.</p>';
      });
  }

  // Restyle the chart when theme changes (no re-fetch needed if already loaded)
  function restyleContributionChart(theme) {
    var container = document.getElementById("contribution-chart");
    if (!container) return;

    var svg = container.querySelector("svg");
    if (!svg) {
      // Chart not loaded yet, load fresh
      loadContributionChart(theme);
      return;
    }

    var emptyFill = theme === "mocha" ? "#313244" : "#ccd0da";
    var activeColor = theme === "mocha" ? "#cba6f7" : "#8839ef";
    var lightActive = theme === "mocha" ? "#d586ff" : "#a855f7";
    var medActive = theme === "mocha" ? "#bb6cff" : "#7c3aed";
    var highActive = theme === "mocha" ? "#6d2ebf" : "#6d28d9";

    var rects = svg.querySelectorAll("rect[data-score]");
    for (var i = 0; i < rects.length; i++) {
      var score = parseInt(rects[i].getAttribute("data-score") || "0", 10);
      var fill;
      if (score === 0) {
        fill = emptyFill;
      } else if (score === 1) {
        fill = lightActive;
      } else if (score === 2) {
        fill = medActive;
      } else if (score >= 3) {
        fill = highActive;
      }
      rects[i].setAttribute("fill", fill);
    }
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
