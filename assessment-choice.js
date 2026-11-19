(() => {
 'use strict';
 const params=new URLSearchParams(location.search);
 if(params.get('challenge')!=='python-skills')return;
 const dialog=document.getElementById('challengeChoiceDialog');
 if(!dialog)return;
 const open=()=>{
  if(typeof dialog.showModal==='function'&&!dialog.open)dialog.showModal();
 };
 function start(theme){
  const starter=theme==='pong'?'python-skills-pong-v4':'python-skills-music-v4';
  const storageKey='python-skills-choice-v4-'+theme;
  let assignment;
  try{assignment=localStorage.getItem(storageKey);}catch{}
  if(!assignment||!/^[a-z0-9]{6,24}$/i.test(assignment)){
   assignment=Math.random().toString(36).slice(2,14);
   try{localStorage.setItem(storageKey,assignment);}catch{}
  }
  const url=new URL(location.href);
  url.search='';url.searchParams.set('starter',starter);url.searchParams.set('assignment',assignment);
  location.assign(url.toString());
 }
 document.getElementById('choosePong')?.addEventListener('click',()=>start('pong'));
 document.getElementById('chooseMusic')?.addEventListener('click',()=>start('music'));
 document.getElementById('choiceClose')?.addEventListener('click',()=>dialog.close());
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',open,{once:true});else open();
})();