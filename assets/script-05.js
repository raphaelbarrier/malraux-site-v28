
(function(){
'use strict';
const login=document.getElementById('profDemoLogin'),privateBox=document.getElementById('teacherPrivateWorkspace'),loginBox=document.getElementById('profLoginSection');
if(!login||!privateBox)return;
const demoUser='prof-demo', demoCode='MALRAUX-DEMO-2026'; // DEMO ONLY: visible in source, NOT a secure authentication system.
function displayAuth(ok){privateBox.hidden=!ok;loginBox.hidden=ok;if(ok){drawWeek();}}
displayAuth(sessionStorage.getItem('malraux-prof-demo')==='yes');
login.addEventListener('submit',e=>{
 e.preventDefault();const d=new FormData(login);
 const ok=String(d.get('username')).trim()===demoUser&&String(d.get('password'))===demoCode;
 document.getElementById('profLoginError').hidden=ok;
 if(ok){sessionStorage.setItem('malraux-prof-demo','yes');login.reset();displayAuth(true);}
});
document.getElementById('profLogout').addEventListener('click',()=>{sessionStorage.removeItem('malraux-prof-demo');displayAuth(false);});
const grid=document.getElementById('teacherWeekGrid'),title=document.getElementById('weekTitle');
let weekShift=0;
function mondayOf(date){let d=new Date(date);d.setHours(12,0,0,0);d.setDate(d.getDate()-(d.getDay()+6)%7);return d}
function iso(d){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`}
function escapeHTML(x){return String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function drawWeek(){
 if(privateBox.hidden)return;
 const m=mondayOf(new Date());m.setDate(m.getDate()+7*weekShift);
 const end=new Date(m);end.setDate(end.getDate()+4);
 title.textContent=`Du ${m.toLocaleDateString('fr-FR',{day:'numeric',month:'long'})} au ${end.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}`;
 let plan=[];try{plan=JSON.parse(localStorage.getItem('malraux_v20_teacher_planning_demo')||'[]')}catch(e){}
 if(!Array.isArray(plan))plan=[];
 grid.innerHTML=Array.from({length:5},(_,i)=>{
 const d=new Date(m);d.setDate(d.getDate()+i);const date=iso(d);
 const items=plan.filter(x=>x.date===date).sort((a,b)=>String(a.time).localeCompare(String(b.time)));
 return `<div class="week-day"><div class="week-day-head">${d.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'short'})}</div>${items.length?items.map(x=>`<div class="week-slot"><small>${escapeHTML(x.time)}</small><strong>${escapeHTML(x.subject)}</strong><small>${escapeHTML(x.room||'')}</small></div>`).join(''):'<p class="week-empty">Aucun cours ajouté</p>'}</div>`;
 }).join('');
}
document.getElementById('prevWeek').addEventListener('click',()=>{weekShift--;drawWeek()});
document.getElementById('nextWeek').addEventListener('click',()=>{weekShift++;drawWeek()});
const form=document.getElementById('teacherPlanForm');
if(form)form.addEventListener('submit',()=>setTimeout(drawWeek,0));
const list=document.getElementById('teacherPlanList');
if(list)list.addEventListener('click',()=>setTimeout(drawWeek,0));
const gallery=document.getElementById('malrauxEventGallery');
const demo=[["Atelier photographie", "Mercredi 21 octobre · 14 h", "Une initiation à la photographie et à la composition d'image. Exemple fictif.", "camera"], ["Forum des formations", "Jeudi 5 novembre · 10 h", "Rencontre de découverte des parcours et des spécialités. Exemple fictif.", "paper"], ["Journée portes ouvertes", "Samedi 14 novembre · 9 h", "Présentation des espaces, des projets et de la vie du lycée. Exemple fictif.", "campus"], ["Rencontre artistique", "Vendredi 20 novembre · 15 h", "Un temps de découverte autour de la création et des arts. Exemple fictif.", "dance"], ["Découverte des métiers", "Mardi 1er décembre · 13 h 30", "Un moment pour explorer différents parcours professionnels. Exemple fictif.", "career"], ["Projet collectif des élèves", "Jeudi 10 décembre · 16 h", "Présentation d'initiatives et de projets réalisés au lycée. Exemple fictif.", "collab"]];
const photos={"camera": "assets/visuel-82eed01c39df.webp", "paper": "assets/visuel-8a2304b15fa9.webp", "campus": "assets/visuel-ee35652e510c.webp"};
photos.dance='https://images.unsplash.com/photo-1760542940028-f597cbe66d47?auto=format&fit=crop&w=1100&q=88';
photos.career='https://www.lboro.ac.uk/media/media/study/schoolandcollegeliaison/cards/preview%20%281%29.jfif';
photos.collab='https://warwick.ac.uk/fac/sci/wmg/study/masters-degrees/international-trade/pro_15_1.jpg';
window.malrauxPhotoFallback=photos.campus;
if(gallery){
 const render=()=>{
 let local=[];try{local=JSON.parse(localStorage.getItem('malraux_v18_demo_data')||'{}').events||[]}catch(e){}
 const rows=[...local.map(e=>({title:e.title,date:(e.date||'Date à confirmer')+' · '+(e.time||''),description:e.description||'',kind:/photo|chasse/i.test(e.title)?'camera':'campus',local:true})),...demo.map(e=>({title:e[0],date:e[1],description:e[2],kind:e[3],local:false}))];
 gallery.innerHTML=rows.map(e=>`<article class="event-card"><img loading="lazy" decoding="async" src="${photos[e.kind]}" alt="Photographie illustrative de l'événement" onerror="this.onerror=null;this.src=window.malrauxPhotoFallback"><div class="event-card-content"><small>${e.local?'ÉVÉNEMENT AJOUTÉ · LOCAL':'EXEMPLE FICTIF · NON PROGRAMMÉ'}</small><h3>${escapeHTML(e.title)}</h3><p><strong>${escapeHTML(e.date)}</strong></p><p>${escapeHTML(e.description)}</p></div></article>`).join('');
 };
 render();window.addEventListener('hashchange',render);window.addEventListener('storage',render);
 const admin=document.getElementById('adminEventsList');if(admin)new MutationObserver(render).observe(admin,{childList:true,subtree:true});
}
})();
