
(function(){
const form=document.getElementById('applicationEmailForm');
if(!form)return;
form.addEventListener('submit',function(event){
 event.preventDefault();
 if(!form.reportValidity())return;
 const subject=document.getElementById('applicationSubject').value.trim();
 const reply=document.getElementById('applicationReply').value.trim();
 const message=document.getElementById('applicationMessage').value.trim();
 if(message.length<15){document.getElementById('applicationMessage').focus();return;}
 const body='Bonjour,\n\n'+message+'\n\n'+(reply?'Adresse de réponse : '+reply+'\n\n':'')+'Cordialement';
 const url='mailto:ce.0640017w@ac-bordeaux.fr?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
 window.location.href=url;
});
})();
