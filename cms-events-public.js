(async function(){
 'use strict';
 const root=document.getElementById('malrauxPublishedEvents');
 if(!root)return;
 const cfg=window.MALRAUX_CMS||{};
 if(!/^https:\/\//.test(cfg.url)||!cfg.anonKey){root.textContent='Agenda non activé : configurez cms-config.js et les tables Supabase pour afficher les événements publiés.';return;}
 try{
  const base=cfg.url.replace(/\/$/,'');
  const endpoint=base+'/rest/v1/cms_events?select=id,title,description,starts_at,image_url&status=eq.published&order=starts_at.asc&limit=60';
  const res=await fetch(endpoint,{headers:{apikey:cfg.anonKey,Authorization:'Bearer '+cfg.anonKey},cache:'no-store'});
  if(!res.ok)throw Error('HTTP '+res.status);
  const rows=await res.json();root.replaceChildren();
  if(!rows.length){root.textContent='Aucun événement publié pour le moment.';return;}
  for(const ev of rows){
   const card=document.createElement('article');card.className='malraux-live-event';
   const date=document.createElement('time');date.dateTime=ev.starts_at;date.textContent=new Date(ev.starts_at).toLocaleString('fr-FR',{dateStyle:'long',timeStyle:'short'});
   const title=document.createElement('h3');title.textContent=ev.title;
   const desc=document.createElement('p');desc.textContent=ev.description;
   if(ev.image_url&&/^https:\/\//.test(ev.image_url)){
    const img=document.createElement('img');img.loading='lazy';img.referrerPolicy='no-referrer';img.alt='Illustration de '+ev.title;img.src=ev.image_url;
    img.addEventListener('error',()=>img.remove());card.append(img);
   }
   card.append(date,title,desc);root.append(card);
  }
 }catch(e){root.textContent='Impossible de charger les événements. Vérifiez la configuration Supabase, les règles de lecture publique et la table cms_events.';console.warn('Agenda CMS :',e.message);}
})();
