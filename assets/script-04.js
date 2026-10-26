
(function(){
"use strict";
const KEY='malraux_v18_demo_data', PLANNER='malraux_v20_teacher_planning_demo';
const photos={"camera": "assets/visuel-82eed01c39df.webp", "paper": "assets/visuel-8a2304b15fa9.webp", "campus": "assets/visuel-ee35652e510c.webp"};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function imageForEvent(title){
 const t=String(title||'').toLowerCase();
 if(/photo|photograph|vidéo|cinéma|film|chasse|audiovisuel/.test(t))return photos.camera;
 if(/inscri|administr|réunion|conseil|orientation/.test(t))return photos.paper;
 return photos.campus;
}
function showEvents(){
 const target=document.getElementById('malrauxEventGallery');if(!target)return;
 let items=[];try{items=JSON.parse(localStorage.getItem(KEY)||'{}').events||[]}catch(e){}
 if(!items.length){
   target.innerHTML='<article class="event-card"><img src="'+photos.camera+'" alt="Caméra utilisée pour illustrer un événement photographique"><div class="event-card-content"><small>EXEMPLE FICTIF · NON PROGRAMMÉ</small><h3>Chasse photographique</h3><p>Exemple de présentation : les administrateurs pourront ajouter une date, une heure, un lieu et une description.</p></div></article>';
   return;
 }
 target.innerHTML=items.map(e=>'<article class="event-card"><img src="'+imageForEvent(e.title)+'" alt="Photographie d’illustration de l’événement"><div class="event-card-content"><small>'+esc(e.date||'Date à préciser')+' · '+esc(e.time||'Horaire à préciser')+'</small><h3>'+esc(e.title)+'</h3><p>'+esc(e.place||'Lieu à préciser')+'</p><p>'+esc(e.description)+'</p><small>ÉVÉNEMENT DE DÉMONSTRATION · LOCAL</small></div></article>').join('');
}
const gallery=document.getElementById('malrauxEventGallery');
if(gallery){showEvents();const anchor=document.getElementById('v18Events');if(anchor)new MutationObserver(showEvents).observe(anchor,{childList:true,subtree:true});window.addEventListener('storage',showEvents);window.addEventListener('hashchange',showEvents);}
function getPlan(){try{const p=JSON.parse(localStorage.getItem(PLANNER)||'[]');return Array.isArray(p)?p.slice(0,100):[]}catch(e){return []}}
function drawPlan(){
 const target=document.getElementById('teacherPlanList');if(!target)return;
 const items=getPlan().sort((a,b)=>(a.date+' '+a.time).localeCompare(b.date+' '+b.time));
 target.innerHTML=items.length?items.map(x=>'<div class="teacher-slot"><div><strong>'+esc(x.subject)+'</strong><small>'+esc(x.date)+' à '+esc(x.time)+(x.room?' · '+esc(x.room):'')+'</small></div><button type="button" data-delete-slot="'+esc(x.id)+'" aria-label="Supprimer le créneau">Retirer</button></div>').join(''):'<p class="teacher-hint">Aucun créneau pour le moment. Ajoutez votre premier cours !</p>';
}
const f=document.getElementById('teacherPlanForm');
if(f){drawPlan();f.addEventListener('submit',e=>{
 e.preventDefault();if(!f.reportValidity())return;
 const d=new FormData(f), item={id:String(Date.now())+Math.random().toString(36).slice(2),subject:String(d.get('subject')).slice(0,80),date:String(d.get('date')),time:String(d.get('time')),room:String(d.get('room')).slice(0,40)};
 try{localStorage.setItem(PLANNER,JSON.stringify([...getPlan(),item]));f.reset();drawPlan()}catch(err){alert('Stockage indisponible dans ce navigateur.')}
 });document.getElementById('teacherPlanList').addEventListener('click',e=>{
 const b=e.target.closest('[data-delete-slot]');if(!b)return;
 localStorage.setItem(PLANNER,JSON.stringify(getPlan().filter(x=>x.id!==b.dataset.deleteSlot)));drawPlan();
 });}
})();
