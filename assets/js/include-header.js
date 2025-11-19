// Loads the header partial and inserts it into the page.
(function(){
  var LS_KEY = 'site_lang';

  function currentLang(){
    // priority: stored preference -> html[lang] -> default en
    var stored = localStorage.getItem(LS_KEY);
    if(stored) return stored;
    var doclang = document.documentElement.lang;
    return doclang === 'si' ? 'si' : 'en';
  }

  function setActiveLink(root, lang){
    var links = root.querySelectorAll('nav a');
    var current = location.pathname.split('/').pop() || (lang === 'si' ? 'index-si.html' : 'index.html');
    links.forEach(function(a){
      // normalize hrefs
      var href = a.getAttribute('href');
      if(href === current){
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });
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
    fetch(partial, {cache: 'no-cache'}).then(function(res){
      if(!res.ok) throw new Error('Could not load header: ' + partial);
      return res.text();
    }).then(function(html){
      var container = document.createElement('div');
      container.innerHTML = html.trim();
      var header = container.firstElementChild;
      var ph = document.getElementById('header-placeholder');
      if(ph && header){
        ph.parentNode.replaceChild(header, ph);
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
