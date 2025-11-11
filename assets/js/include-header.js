// Loads the header partial and inserts it into the page.
(function(){
  function setActiveLink(root){
    var links = root.querySelectorAll('nav a');
    var current = location.pathname.split('/').pop() || 'index.html';
    links.forEach(function(a){
      if(a.getAttribute('href') === current){
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });
  }

  function setPageTitle(root){
    // If page has a data-header-title attribute on the placeholder, use it.
    var placeholder = document.getElementById('header-placeholder');
    var title = placeholder && placeholder.getAttribute('data-header-title');
    var h1 = root.querySelector('#page-title');
    if(h1){
      h1.textContent = title || document.title.replace(/\s*\|.*$/,'') || '';
    }
  }

  function setLanguageSwitch(root){
    var placeholder = document.getElementById('header-placeholder');
    var lang = document.documentElement.lang || 'en';
    var container = root.querySelector('#language-switch');
    if(!container) return;
    if(lang === 'en'){
      container.innerHTML = '<strong>English</strong> | <a href="' + location.pathname.replace('.html','-si.html') + '">සිංහල</a>';
      container.style.display = '';
    } else if(lang === 'si'){
      container.innerHTML = '<a href="' + location.pathname.replace('-si.html','.html') + '">English</a> | <strong>සිංහල</strong>';
      container.style.display = '';
    } else {
      container.style.display = 'none';
    }
  }

  function loadHeader(){
    fetch('partials/header.html', {cache: 'no-cache'}).then(function(res){
      if(!res.ok) throw new Error('Could not load header');
      return res.text();
    }).then(function(html){
      var container = document.createElement('div');
      container.innerHTML = html.trim();
      var header = container.firstElementChild;
      var ph = document.getElementById('header-placeholder');
      if(ph && header){
        ph.parentNode.replaceChild(header, ph);
        setActiveLink(header);
        setPageTitle(header);
        setLanguageSwitch(header);
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
