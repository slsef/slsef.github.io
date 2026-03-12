// Loads the header partial and inserts it into the page.
(function () {
  var LS_KEY = "site_lang";

  function currentLang() {
    var doclang = document.documentElement.lang;
    if (doclang === "si" || doclang === "en") return doclang;
    var stored = localStorage.getItem(LS_KEY);
    if (stored === "si" || stored === "en") return stored;
    return "en";
  }

  function currentPage(lang) {
    return location.pathname.split("/").pop() || (lang === "si" ? "index-si.html" : "index.html");
  }

  function setActiveLink(root, lang) {
    var current = currentPage(lang);

    root.querySelectorAll(".nav-link").forEach(function (link) {
      var href = link.getAttribute("href");
      if (href === current) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      } else {
        link.classList.remove("active");
        link.removeAttribute("aria-current");
      }
    });

    var collapseEl = root.querySelector("#mainNavbar");
    if (!collapseEl) return;

    root.querySelectorAll(".nav-link").forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.bootstrap && collapseEl.classList.contains("show")) {
          var bsCollapse = bootstrap.Collapse.getInstance(collapseEl) || new bootstrap.Collapse(collapseEl);
          bsCollapse.hide();
        }
      });
    });
  }

  function buildPathForLang(pathname, lang) {
    if (!pathname) pathname = currentPage(lang);
    if (lang === "si") {
      if (pathname.endsWith("-si.html")) return pathname;
      return pathname.replace(/\.html$/, "-si.html");
    }
    if (pathname.endsWith("-si.html")) return pathname.replace(/-si\.html$/, ".html");
    return pathname;
  }

  function onLangChange(ev) {
    var newLang = ev.target.value;
    localStorage.setItem(LS_KEY, newLang);

    var current = location.pathname.split("/").pop();
    var target = buildPathForLang(current, newLang);
    var newUrl = location.pathname.replace(/[^/]*$/, target) + location.search + location.hash;
    location.href = newUrl;
  }

  function wireLangSelect(root, lang) {
    var sel = root.querySelector("#lang-select");
    if (!sel) return;
    sel.value = lang;
    sel.addEventListener("change", onLangChange);
  }

  function showPage() {
    try {
      document.documentElement.classList.remove("js-hide-body");
    } catch (e) {
      console.error("header visibility error", e);
    }
  }

  function applyHeader(root, lang) {
    if (!root) return;
    setActiveLink(root, lang);
    wireLangSelect(root, lang);
    showPage();
  }

  function mountHeader(html, lang) {
    var container = document.createElement("div");
    container.innerHTML = html.trim();
    var nextHeader = container.firstElementChild;
    if (!nextHeader) return null;

    var existing = document.querySelector("header.site-header");
    var placeholder = document.getElementById("header-placeholder");

    if (existing) {
      existing.parentNode.replaceChild(nextHeader, existing);
    } else if (placeholder) {
      placeholder.parentNode.replaceChild(nextHeader, placeholder);
    }

    applyHeader(nextHeader, lang);
    return nextHeader;
  }

  function skeletonHtml(lang) {
    var homeHref = lang === "si" ? "index-si.html" : "index.html";
    var overline = lang === "si" ? "ශිෂ්‍යත්ව සහ මාර්ගෝපදේශනය" : "Scholarships and mentorship";
    var brand = lang === "si"
      ? "ශ්‍රී ලංකා ශිෂ්‍ය සවිබල ගැන්වීමේ අරමුදල"
      : "Sri Lanka Student Empowerment Foundation";

    return [
      '<header id="site-header" class="site-header">',
      '  <nav class="navbar navbar-expand-lg navbar-dark site-nav">',
      '    <div class="container-xl">',
      '      <a class="navbar-brand brand-lockup" href="' + homeHref + '">',
      '        <span class="brand-mark"><img src="assets/images/logo.png" alt="SLSEF Logo" class="brand-logo"></span>',
      '        <span class="brand-copy">',
      '          <span class="brand-overline">' + overline + "</span>",
      '          <span class="brand-name d-none d-lg-inline">' + brand + "</span>",
      '          <span class="brand-name d-inline d-lg-none">SLSEF</span>',
      "        </span>",
      "      </a>",
      "    </div>",
      "  </nav>",
      "</header>"
    ].join("");
  }

  function loadHeader() {
    var lang = currentLang();
    var partial = lang === "si" ? "partials/header-si.html" : "partials/header.html";
    var cacheKey = "header_html_" + lang;
    var cached = null;

    try {
      cached = sessionStorage.getItem(cacheKey);
    } catch (e) {
      cached = null;
    }

    if (cached) {
      mountHeader(cached, lang);
    } else if (document.getElementById("header-placeholder")) {
      mountHeader(skeletonHtml(lang), lang);
    }

    fetch(partial, { cache: "no-cache" })
      .then(function (res) {
        if (!res.ok) throw new Error("Could not load header: " + partial);
        return res.text();
      })
      .then(function (html) {
        try {
          sessionStorage.setItem(cacheKey, html);
        } catch (e) {
          // Ignore storage errors and continue.
        }

        var existing = document.querySelector("header.site-header");
        if (!existing || existing.outerHTML !== html.trim()) {
          mountHeader(html, lang);
        } else {
          applyHeader(existing, lang);
        }
      })
      .catch(function (err) {
        console.error(err);
        showPage();
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadHeader);
  } else {
    loadHeader();
  }
})();
