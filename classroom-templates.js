/* Python Lab CS50P problem set gallery. No answer keys or solved exercises. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 let install=null;
 const source=()=>window.pythonLabCS50P;
 function show(){
  const dialog=$('templatesDialog');
  render();
  if(dialog?.showModal&&!dialog.open)dialog.showModal();
 }
 function get(id){return source()?.get(id)||null;}
 function assignmentUrl(id){
  if(!get(id))throw Error('Unknown starter project');
  const url=new URL(window.location.href);
  url.search='';url.hash='';
  url.searchParams.set('starter',id);
  url.searchParams.set('assignment',Math.random().toString(36).slice(2,12));
  return url.toString();
 }
 async function copyLink(problem,button){
  const link=assignmentUrl(problem.id);
  try{
   if(typeof navigator!=='undefined'&&navigator.clipboard?.writeText){
    await navigator.clipboard.writeText(link);
    button.textContent='Copied for Canvas';
    return;
   }
  }catch{}
  const fallback=prompt('Copy this starter link into Canvas:',link);
  if(fallback!==null)button.textContent='Link available';
 }
 function render(){
  const host=$('templateGallery');if(!host)return;
  host.textContent='';
  const library=source();
  if(!library){
   const info=document.createElement('p');
   info.textContent='CS50P starter library is unavailable. Reload the page and try again.';
   host.append(info);return;
  }
  const selected=String($('templateSetFilter')?.value||'all');
  const query=String($('templateSearch')?.value||'').trim().toLowerCase();
  const matches=library.catalog().filter(problem=>
   (selected==='all'||String(problem.set)===selected) &&
   (!query||[problem.title,problem.description,problem.filename,'pset '+problem.set].some(text=>text.toLowerCase().includes(query)))
  );
  const count=$('templateCount');
  if(count)count.textContent=matches.length+' of '+library.catalog().length+' CS50P problems';
  if(!matches.length){
   const message=document.createElement('p');message.className='analysis-empty';
   message.textContent='No matching problems. Try a different set or search term.';
   host.append(message);return;
  }
  let currentSet=null;
  for(const problem of matches){
   if(currentSet!==problem.set){
    currentSet=problem.set;
    const heading=document.createElement('h4');heading.className='template-set-heading';
    heading.textContent='Problem Set '+problem.set+' · '+problem.subject;
    host.append(heading);
   }
   const card=document.createElement('div');card.className='template-option';
   const start=document.createElement('button');start.className='template-choice';
   const label=document.createElement('strong');label.textContent=problem.title;
   const metadata=document.createElement('span');metadata.className='template-filename';
   metadata.textContent=problem.filename;
   const description=document.createElement('span');description.textContent=problem.description;
   start.append(label,metadata,description);
   start.title='Create '+problem.title+' as a new project folder';
   start.onclick=()=>{
    const result=install?.(get(problem.id));
    if(result)$('templatesDialog')?.close?.();
   };
   const actions=document.createElement('div');actions.className='template-card-actions';
   const link=document.createElement('a');link.className='template-official-link';
   link.textContent='Official instructions';
   link.href=problem.url;link.target='_blank';link.rel='noopener noreferrer';
   const share=document.createElement('button');share.className='template-link';
   share.textContent='Copy assignment link';
   share.title='Share this unsolved starter in Canvas';
   share.onclick=()=>copyLink(problem,share);
   actions.append(link,share);
   card.append(start,actions);host.append(card);
  }
 }
 function populateFilters(){
  const select=$('templateSetFilter');if(!select)return;
  select.textContent='';
  const library=source();
  const options=[['all','All problem sets'],...(library?.subjects||[]).map((subject,i)=>[String(i),'Set '+i+' · '+subject])];
  for(const [value,label] of options){
   const option=document.createElement('option');option.value=value;option.textContent=label;
   select.append(option);
  }
  select.value='all';
 }
 $('templateBtn')?.addEventListener('click',show);
 $('templateClose')?.addEventListener('click',()=> $('templatesDialog')?.close?.());
 $('templateSearch')?.addEventListener('input',render);
 $('templateSetFilter')?.addEventListener('change',render);
 function attach(callback){install=callback;populateFilters();render();}
 window.pythonLabTemplates={
  attach,show,get,assignmentUrl,render,
  catalog:()=>source()?.catalog()||[]
 };
})();
