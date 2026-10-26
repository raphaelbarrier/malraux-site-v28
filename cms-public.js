(async function(){
  'use strict';
  const cfg=window.MALRAUX_CMS||{};
  if(!/^https:\/\//.test(cfg.url)||!cfg.anonKey)return;
  const escapeKey=k=>String(k).replace(/[^a-z0-9_-]/gi,'');
  try{
    const [manifest,resp]=await Promise.all([
      fetch('cms-fields.json',{cache:'no-store'}).then(r=>r.json()),
      fetch(cfg.url.replace(/\/$/,'')+'/rest/v1/cms_published?select=content_key,body',{headers:{'apikey':cfg.anonKey,'Authorization':'Bearer '+cfg.anonKey},cache:'no-store'})
    ]);
    if(!resp.ok)throw Error('HTTP '+resp.status);
    const rows=await resp.json();
    const allowed=new Map(manifest.map(f=>[f.key,f.selector]));
    for(const item of rows){
      const selector=allowed.get(escapeKey(item.content_key));
      if(!selector||typeof item.body!=='string')continue;
      const el=document.querySelector(selector);
      if(el)el.textContent=item.body;
    }
  }catch(err){console.warn('Contenus CMS indisponibles : contenus intégrés conservés.',err.message);}
})();
