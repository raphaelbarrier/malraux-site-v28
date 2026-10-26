(function(){'use strict';
const h=document.querySelector('.header');
if(h)addEventListener('scroll',()=>h.classList.toggle('is-scrolled',scrollY>8),{passive:true});
if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}}),{threshold:.12});
document.querySelectorAll('.quicklinks,.news-overview,.welcome,.apply-layout').forEach(el=>{el.classList.add('v28-reveal');io.observe(el);});
})();
