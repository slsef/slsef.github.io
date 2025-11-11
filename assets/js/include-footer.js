// Loads the footer partial and inserts it into the page, showing language-specific lines
(function(){
  function setFooterLanguage(root){
    var lang = document.documentElement.lang || 'en';
    var en = root.querySelectorAll('.footer-en');
    var si = root.querySelectorAll('.footer-si');
    if(lang === 'si'){
      en.forEach(function(n){ n.style.display = 'none'; });
      si.forEach(function(n){ n.style.display = ''; });
    } else {
      en.forEach(function(n){ n.style.display = ''; });
      si.forEach(function(n){ n.style.display = 'none'; });
    }
  }

  function loadFooter(){
    fetch('partials/footer.html', {cache: 'no-cache'}).then(function(res){
      if(!res.ok) throw new Error('Could not load footer');
      return res.text();
    }).then(function(html){
      var container = document.createElement('div');
      container.innerHTML = html.trim();
      var footer = container.firstElementChild;
      var ph = document.getElementById('footer-placeholder');
      if(ph && footer){
        ph.parentNode.replaceChild(footer, ph);
        setFooterLanguage(footer);
      }
    }).catch(function(err){
      console.error(err);
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', loadFooter);
  } else {
    loadFooter();
  }
})();
