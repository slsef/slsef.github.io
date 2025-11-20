// Loads the header partial and inserts it into the page.
(function(){
  var LS_KEY = 'site_lang';

  function currentLang(){
  // priority: page html[lang] -> stored preference -> default en
  var doclang = document.documentElement.lang;
  if(doclang === 'si' || doclang === 'en') return doclang;
  var stored = localStorage.getItem(LS_KEY);
  if(stored) return stored;
  return 'en';
  }

  function setActiveLink(root, lang){
    var links = root.querySelectorAll('.nav-link');
    var current = location.pathname.split('/').pop() || (lang === 'si' ? 'index-si.html' : 'index.html');
    links.forEach(function(a){
      var href = a.getAttribute('href');
      if(href === current){
        a.classList.add('active');
        a.setAttribute('aria-current','page');
      } else {
        a.classList.remove('active');
        a.removeAttribute('aria-current');
      }
    });
    // close navbar collapse on small screens when a link is clicked
    var collapseEl = root.querySelector('#mainNavbar');
    if(collapseEl){
      root.querySelectorAll('.nav-link').forEach(function(link){
        link.addEventListener('click', function(){
          if(window.bootstrap && collapseEl.classList.contains('show')){
            var bsCollapse = bootstrap.Collapse.getInstance(collapseEl) || new bootstrap.Collapse(collapseEl);
            bsCollapse.hide();
          }
        });
      });
    }
  }

  function setPageTitle(root){
    var placeholder = document.getElementById('header-placeholder');
    var title = placeholder && placeholder.getAttribute('data-header-title');
    var h1 = root.querySelector('#page-title');
    if(h1){
      h1.textContent = title || document.title.replace(/\s*\|.*$/,'') || '';
    }
  }

  function buildPathForLang(pathname, lang){
    // swap base filename to -si variants or plain
    if(!pathname) pathname = location.pathname.split('/').pop() || 'index.html';
    if(lang === 'si'){
      if(pathname.endsWith('-si.html')) return pathname;
      return pathname.replace(/\.html$/, '-si.html');
    } else {
      if(pathname.endsWith('-si.html')) return pathname.replace(/-si\.html$/, '.html');
      return pathname;
    }
  }

  function onLangChange(ev){
    var sel = ev.target;
    var newLang = sel.value;
    localStorage.setItem(LS_KEY, newLang);
    // compute target page in selected language
    var target = buildPathForLang(location.pathname.split('/').pop(), newLang);
    // If already on that page, just reload to apply lang changes
    if(location.pathname.split('/').pop() === target){
      // update html lang and update header in-place
      document.documentElement.lang = newLang === 'si' ? 'si' : 'en';
      // reload header to swap content
      loadHeader();
      return;
    }
    // otherwise navigate to the page in selected language (preserve query/hash)
    var newUrl = location.pathname.replace(/[^\/]*$/, target) + location.search + location.hash;
    location.href = newUrl;
  }

  function wireLangSelect(root, lang){
    var sel = root.querySelector('#lang-select');
    if(!sel) return;
    sel.value = lang;
    sel.addEventListener('change', onLangChange);
  }

  function loadHeader(){
    var lang = currentLang();
    var partial = lang === 'si' ? 'partials/header-si.html' : 'partials/header.html';
    // Use sessionStorage cache per language to avoid refetching the header on each page load
    var CACHE_PREFIX = 'header_html_';
    var cacheKey = CACHE_PREFIX + lang;
    var ph = document.getElementById('header-placeholder');
    try{
      // If we have a cached header for this language, insert it immediately
      var cached = null;
      try { cached = sessionStorage.getItem(cacheKey); } catch(e) { cached = null; }
      if(cached){
        var container = document.createElement('div');
        container.innerHTML = cached.trim();
        var header = container.firstElementChild;
        if(ph && header){ ph.parentNode.replaceChild(header, ph); }
  // remove JS hide flag so body becomes visible
  try{ document.documentElement.classList.remove('js-hide-body'); }catch(e){}
        // Wire up behaviors on the cached header
        if(header){ setActiveLink(header, lang); setPageTitle(header); wireLangSelect(header, lang); }
      } else {
        // render a minimal skeleton immediately to avoid a visible blank header while fetching
        if(ph){
          var skeletonHtml = '<nav class="navbar navbar-expand-lg navbar-dark" style="background:var(--brand);">'
            + '<div class="container-fluid">'
            + '<a class="navbar-brand d-flex align-items-center" href="' + (lang === 'si' ? 'index-si.html' : 'index.html') + '">'
            + '<img src="assets/images/logo.png" alt="SLSEF Logo" height="48" class="d-inline-block align-text-top">'
            + '<span class="ms-2 d-none d-lg-inline">' + (lang === 'si' ? '\u0dc6\u0dd2\u0dbb\u0dd2 \u0dc3\u0dd2\u0db1\u0dd2\u0db1 \u0dc3\u0dca\u200d\u0db4\u0dd2\u0dbb\u0dd2\u0db1\u0dca (SLSEF)' : 'Sri Lanka Student Empowerment Foundation (SLSEF)') + '</span>'
            + '<span class="ms-2 d-inline d-lg-none small">SLSEF</span>'
            + '</a>'
            + '</div>'
            + '</nav>';
          var tmp = document.createElement('div'); tmp.innerHTML = skeletonHtml.trim();
          var skeletonHeader = tmp.firstElementChild;
          ph.parentNode.replaceChild(skeletonHeader, ph);
          try{ document.documentElement.classList.remove('js-hide-body'); }catch(e){}
        }
      }
    } catch(e){
      // ignore skeleton errors and continue to fetch
      console.error('header skeleton error', e);
    }

    // Stale-while-revalidate: fetch the partial in background. If it differs from cache, update DOM and cache.
    fetch(partial, {cache: 'no-cache'}).then(function(res){
      if(!res.ok) throw new Error('Could not load header: ' + partial);
      return res.text();
    }).then(function(html){
      // update session cache
      try { sessionStorage.setItem(cacheKey, html); } catch(e) { /* ignore storage errors */ }

      var container = document.createElement('div');
      container.innerHTML = html.trim();
      var header = container.firstElementChild;
      var existing = document.querySelector('nav.navbar');
      // If there's existing header HTML, compare strings; only replace if changed
      try{
        var existingHtml = existing ? existing.outerHTML : null;
        if(!existingHtml || (existingHtml !== html.trim())){
          if(existing && header){ existing.parentNode.replaceChild(header, existing); }
          setActiveLink(header, lang);
          setPageTitle(header);
          wireLangSelect(header, lang);
          try{ document.documentElement.classList.remove('js-hide-body'); }catch(e){}
        }
      } catch(e){
        // fallback: replace
        if(existing && header){ existing.parentNode.replaceChild(header, existing); }
        setActiveLink(header, lang);
        setPageTitle(header);
        wireLangSelect(header, lang);
      }
    }).catch(function(err){
      console.error(err);
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', loadHeader);
  } else {
    loadHeader();
  }
})();
