import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.49.4';
const $=s=>document.querySelector(s);
const cfg=window.MALRAUX_CMS||{};
const configured=/^https:\/\//.test(cfg.url)&&!!cfg.anonKey;
let supa=null, user=null, profile=null, fields=[], drafts=new Map(), published=new Map();
const roles={editor:'Rédacteur',publisher:'Éditeur / publication',admin:'Administrateur'};
const staffRoles={
 super_admin:'👑 Super administrateur',direction:'🎓 Direction',
 direction_adjointe:'🏫 Direction adjointe',site_admin:'💻 Administrateur du site',
 secretariat:'📋 Secrétariat',intendance:'💶 Intendance',
 responsable_pedagogique:'📚 Responsable pédagogique',enseignant:'👨‍🏫 Enseignant',
 communication:'📢 Communication',redacteur:'✍️ Rédacteur'
};
const notice=(msg,error=false)=>{$('#notice').textContent=msg;$('#notice').style.color=error?'#a72a2a':'#276442';};
function visible(id){for(const s of ['setup','login','workspace'])$('#'+s).hidden=s!==id;$('#logout').hidden=id!=='workspace';}
function check(error){if(error)throw error;}
async function loadProfile(){const {data,error}=await supa.from('cms_profiles').select('id,email,role,staff_role').eq('id',user.id).single();check(error);profile=data;}
async function refreshContent(){
 const [d,p]=await Promise.all([supa.from('cms_drafts').select('content_key,body,updated_at'),supa.from('cms_published').select('content_key,body,published_at')]);check(d.error);check(p.error);
 drafts=new Map((d.data||[]).map(x=>[x.content_key,x]));published=new Map((p.data||[]).map(x=>[x.content_key,x]));showField();
}
function showField(){const key=$('#field').value,def=fields.find(f=>f.key===key);if(!def)return;
 $('#body').value=drafts.get(key)?.body??published.get(key)?.body??def.default;
 $('#fieldInfo').textContent=(drafts.has(key)?'Brouillon enregistré. ':'Aucun brouillon. ')+(published.has(key)?'Version publiée disponible.':'Texte initial du site affiché tant que rien n’est publié.');
}
async function loadUsers(){const box=$('#userList');box.replaceChildren();if(profile.role!=='admin'){box.textContent='Réservé aux administrateurs.';return;}
 const {data,error}=await supa.from('cms_profiles').select('id,email,role,staff_role').order('email');check(error);
 for(const p of data||[]){const row=document.createElement('div');row.className='userrow';const label=document.createElement('span');label.textContent=p.email;const select=document.createElement('select');
 for(const [value,name] of Object.entries(staffRoles)){const opt=new Option(name,value);select.add(opt);}select.value=p.staff_role;
 select.addEventListener('change',async()=>{try{const {error}=await supa.rpc('cms_set_staff_role',{target_id:p.id,new_staff_role:select.value});check(error);notice('Rôle mis à jour.');if(p.id===user.id)await initialize();}catch(e){select.value=p.staff_role;notice(e.message,true);}});
 row.append(label,select);box.append(row);}
}
async function loadHistory(){const box=$('#auditList');box.replaceChildren();const {data,error}=await supa.from('cms_audit').select('action,content_key,created_at').order('created_at',{ascending:false}).limit(50);check(error);
 for(const x of data||[]){const row=document.createElement('div');row.className='auditrow';row.textContent=`${new Date(x.created_at).toLocaleString('fr-FR')} — ${x.action} — ${x.content_key}`;box.append(row);}if(!(data||[]).length)box.textContent='Aucune publication pour le moment.';
}
async function initialize(){await loadProfile();$('#identity').textContent=user.email;$('#role').textContent=staffRoles[profile.staff_role]||roles[profile.role]||profile.role;
 visible('workspace');$('#publish').hidden=profile.role==='editor';document.querySelector('[data-tab="users"]').hidden=profile.role!=='admin';
 await refreshContent();}
async function start(){if(!configured){visible('setup');return;}
 supa=createClient(cfg.url,cfg.anonKey,{auth:{persistSession:true,autoRefreshToken:true}});
 const {data:{user:current}}=await supa.auth.getUser();user=current;
 if(!user){visible('login');return;}
 try{await initialize();}catch(e){notice('Accès refusé ou configuration incomplète : '+e.message,true);await supa.auth.signOut();visible('login');}
}
$('#loginForm').addEventListener('submit',async e=>{e.preventDefault();$('#loginError').textContent='';
 try{const {data,error}=await supa.auth.signInWithPassword({email:$('#email').value,password:$('#password').value});check(error);user=data.user;await initialize();$('#password').value='';}catch(err){$('#loginError').textContent='Connexion impossible : '+err.message;}
});
$('#logout').addEventListener('click',async()=>{await supa.auth.signOut();user=null;profile=null;visible('login');notice('Déconnecté.');});
$('#field').addEventListener('change',showField);
$('#save').addEventListener('click',async()=>{try{const key=$('#field').value,body=$('#body').value;if(!key||!body.trim())throw Error('Le texte ne peut pas être vide.');
 const {error}=await supa.from('cms_drafts').upsert({content_key:key,body,updated_by:user.id},{onConflict:'content_key'});check(error);await refreshContent();notice('Brouillon enregistré. Le site public ne change pas avant publication.');}catch(e){notice(e.message,true);}});
$('#publish').addEventListener('click',async()=>{if(!confirm('Publier ce brouillon sur le site public ?'))return;try{
 const key=$('#field').value;const {error}=await supa.rpc('cms_publish',{item_key:key});check(error);await refreshContent();notice('Publication réussie. Actualisez le site public pour voir le résultat.');}catch(e){notice(e.message,true);}});
$('#restore').addEventListener('click',()=>{const key=$('#field').value;$('#body').value=published.get(key)?.body??fields.find(f=>f.key===key)?.default??'';notice('Texte chargé dans le formulaire. Cliquez sur Enregistrer pour en faire un brouillon.');});
document.querySelectorAll('.tab').forEach(btn=>btn.addEventListener('click',async()=>{document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b===btn));for(const id of ['contents','events','users','history'])$('#'+id).hidden=btn.dataset.tab!==id;
 try{if(btn.dataset.tab==='events')await loadEvents();if(btn.dataset.tab==='users')await loadUsers();if(btn.dataset.tab==='history')await loadHistory();}catch(e){notice(e.message,true);}}));
fetch('cms-fields.json').then(r=>r.json()).then(items=>{fields=items;for(const f of fields)$('#field').add(new Option(f.label,f.key));return start();}).catch(e=>notice('Impossible de charger la liste des contenus : '+e.message,true));

// Événements : toutes les opérations passent par les politiques RLS Supabase.
let eventRows=[];
const eventBox=$('#eventList'),eventForm=$('#eventForm');
const eventMsg=(message,error=false)=>{const el=$('#eventNotice');el.textContent=message;el.style.color=error?'#a72a2a':'#276442';};
function resetEvent(){eventForm.reset();$('#eventId').value='';$('#eventFormWrap').hidden=true;}
$('#newEvent').addEventListener('click',()=>{eventForm.reset();$('#eventId').value='';$('#eventFormWrap').hidden=false;$('#eventTitle').focus();});
$('#cancelEvent').addEventListener('click',resetEvent);
function eventPayload(status){
 const starts=$('#eventDate').value,title=$('#eventTitle').value.trim(),description=$('#eventDescription').value.trim(),url=$('#eventImage').value.trim();
 if(!starts||!Number.isFinite(new Date(starts).getTime()))throw Error('Date et heure invalides.');
 if(title.length<3||title.length>160||description.length<3||description.length>4000)throw Error('Vérifiez le titre et la description.');
 if(url){const parsed=new URL(url);if(parsed.protocol!=='https:')throw Error('Le lien de l’image doit commencer par https://');}
 return {title,description,starts_at:new Date(starts).toISOString(),image_url:url||null,status,updated_by:user.id,published_at:status==='published'?new Date().toISOString():null};
}
async function saveEvent(status){
 try{
  if(!user||!profile)throw Error('Connexion requise.');
  if(status==='published'&&profile.role==='editor')throw Error('Publication réservée aux éditeurs et administrateurs.');
  const id=$('#eventId').value,payload=eventPayload(status);
  if(!id)payload.created_by=user.id;
  const query=id?supa.from('cms_events').update(payload).eq('id',id):supa.from('cms_events').insert(payload);
  const {error}=await query;check(error);
  resetEvent();await loadEvents();eventMsg(status==='published'?'Événement publié sur le site public.':'Brouillon enregistré.');
 }catch(e){eventMsg(e.message||'Erreur de sauvegarde.',true);}
}
eventForm.addEventListener('submit',e=>{e.preventDefault();saveEvent('draft');});
$('#publishEvent').addEventListener('click',()=>{if(eventForm.reportValidity()&&confirm('Publier cet événement sur le site public ?'))saveEvent('published');});
function localDateInput(iso){const d=new Date(iso),local=new Date(d.getTime()-d.getTimezoneOffset()*60000);return local.toISOString().slice(0,16);}
async function loadEvents(){
 const {data,error}=await supa.from('cms_events').select('id,title,description,starts_at,image_url,status,created_by').order('starts_at',{ascending:false}).limit(100);check(error);
 eventRows=data||[];eventBox.replaceChildren();$('#publishEvent').hidden=profile.role==='editor';
 if(!eventRows.length){eventBox.textContent='Aucun événement. Cliquez sur « Créer un événement ». ';return;}
 for(const ev of eventRows){
  const row=document.createElement('div');row.className='auditrow';
  const info=document.createElement('div');const name=document.createElement('strong');name.textContent=ev.title;
  const meta=document.createElement('div');meta.textContent=new Date(ev.starts_at).toLocaleString('fr-FR')+' · '+(ev.status==='published'?'🟢 Publié':'🟡 Brouillon');info.append(name,meta);
  const edit=document.createElement('button');edit.type='button';edit.textContent='Modifier';
  const canEdit=profile.role!=='editor'||(ev.status==='draft'&&ev.created_by===user.id);
  edit.disabled=!canEdit;edit.addEventListener('click',()=>{
   $('#eventId').value=ev.id;$('#eventTitle').value=ev.title;$('#eventDescription').value=ev.description;
   $('#eventDate').value=localDateInput(ev.starts_at);$('#eventImage').value=ev.image_url||'';
   $('#eventFormWrap').hidden=false;$('#eventTitle').focus();
  });row.append(info,edit);eventBox.append(row);
 }
}
