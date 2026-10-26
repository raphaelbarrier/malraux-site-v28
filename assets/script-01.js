
(function(){
const pages=document.querySelectorAll('.detail-page');
function route(){
 const hash=decodeURIComponent(location.hash||'#accueil');
 const slug=hash.startsWith('#page/')?hash.slice(6):null;
 const target=slug&&document.getElementById('page-'+slug);
 document.body.classList.toggle('detail-mode',!!target);
 pages.forEach(p=>p.style.display=(p===target)?'block':'none');
 if(target){document.title=target.querySelector('h1').textContent+' — Lycée André-Malraux';}
 else{document.title='Lycée André-Malraux — Projet de site';}
 window.scrollTo(0,0);
}
window.addEventListener('hashchange',route);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',route);else route();
})();
