/* Python Lab project storage: IndexedDB first, localStorage fallback.
 * All data stays in the student's browser; no accounts or server requests. */
(() => {
 'use strict';
 const DB_NAME='python-lab-projects-v1';
 const META_KEY='python-lab-active-project-v1';
 const FALLBACK_KEY='python-lab-projects-fallback-v1';
 const LEGACY_KEY='python-lab-v1';
 const STORE='projects';
 let database=null,mode='memory',memory={};
 let queue=Promise.resolve();
 const cleanName=value=>String(value||'Untitled Project').trim().slice(0,70)||'Untitled Project';
 const copy=data=>JSON.parse(JSON.stringify(data));
 const makeId=()=> typeof crypto!=='undefined'&&crypto.randomUUID?
   'project-'+crypto.randomUUID() : 'project-'+Date.now()+'-'+Math.random().toString(36).slice(2,10);
 function storageGet(key){try{return localStorage.getItem(key);}catch{return null;}}
 function storageSet(key,value){try{localStorage.setItem(key,value);return true;}catch{return false;}}
 function openDatabase(){
  return new Promise((resolve,reject)=>{
   if(typeof indexedDB==='undefined'){reject(Error('IndexedDB unavailable'));return;}
   const request=indexedDB.open(DB_NAME,1);
   request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains(STORE))request.result.createObjectStore(STORE,{keyPath:'id'});};
   request.onsuccess=()=>resolve(request.result);
   request.onerror=()=>reject(request.error||Error('Cannot open IndexedDB'));
   request.onblocked=()=>reject(Error('IndexedDB upgrade blocked'));
  });
 }
 function idb(op,record){
  return new Promise((resolve,reject)=>{
   if(!database){reject(Error('Storage database not initialized'));return;}
   let result;
   const tx=database.transaction(STORE,op==='get'||op==='all'?'readonly':'readwrite');
   const store=tx.objectStore(STORE);
   let request;
   if(op==='get')request=store.get(record);
   else if(op==='all')request=store.getAll();
   else if(op==='put')request=store.put(record);
   else if(op==='delete')request=store.delete(record);
   request.onsuccess=()=>{result=request.result;};
   request.onerror=()=>reject(request.error||Error('Project operation failed'));
   tx.oncomplete=()=>resolve(result);
   tx.onerror=()=>reject(tx.error||Error('Project transaction failed'));
   tx.onabort=()=>reject(tx.error||Error('Project transaction aborted'));
  });
 }
 function fallbackWrite(){
  if(mode==='memory')return;
  if(!storageSet(FALLBACK_KEY,JSON.stringify(memory)))mode='memory';
 }
 async function getRecord(id){
  if(mode==='indexeddb')return await idb('get',id);
  return memory[id]?copy(memory[id]):undefined;
 }
 async function getAll(){
  if(mode==='indexeddb')return await idb('all');
  return Object.values(memory).map(copy);
 }
 async function putRecord(record){
  if(mode==='indexeddb')return idb('put',copy(record));
  memory[record.id]=copy(record);fallbackWrite();
 }
 async function deleteRecord(id){
  if(mode==='indexeddb')return idb('delete',id);
  delete memory[id];fallbackWrite();
 }
 function transaction(action){
  const result=queue.then(action);
  queue=result.catch(()=>{});
  return result;
 }
 function activeId(){return storageGet(META_KEY);}
 async function init(legacy){
  try{database=await openDatabase();mode='indexeddb';}
  catch{
   const old=storageGet(FALLBACK_KEY);
   try{memory=old&&JSON.parse(old)||{};}catch{memory={};}
   mode='localStorage';if(!storageSet(FALLBACK_KEY,JSON.stringify(memory)))mode='memory';
  }
  let projects=await getAll();
  if(!projects.length){
   // One-time migration from the original Python Lab workspace.
   const snapshot=legacy&&typeof legacy==='object'&&Object.keys(legacy.files||{}).length?
    copy(legacy):{filename:'main.py',files:{'main.py':'# Welcome to Python Lab!\nprint("Hello, Python!")\n'},dirs:[],cwd:''};
   const id=makeId(),now=Date.now();
   const record={id,name:'My Python Lab',snapshot,createdAt:now,updatedAt:now,assignmentKey:''};
   await putRecord(record);projects=[record];
   storageSet(META_KEY,id);
  }
  const wanted=activeId();
  const selected=projects.find(p=>p.id===wanted)||projects.slice().sort((a,b)=>b.updatedAt-a.updatedAt)[0];
  storageSet(META_KEY,selected.id);
  return {project:copy(selected),mode};
 }
 async function list(){
  await queue;
  const result=await getAll();
  return result.map(({id,name,updatedAt,createdAt,assignmentKey})=>({id,name,updatedAt,createdAt,assignmentKey:assignmentKey||''}))
   .sort((a,b)=>b.updatedAt-a.updatedAt);
 }
 async function get(id){await queue;const record=await getRecord(id);return record?copy(record):null;}
 async function save(id,snapshot){
  if(!id||!snapshot)throw Error('Project must have a valid ID and workspace');
  const safe=copy(snapshot);
  return transaction(async()=>{
   const record=await getRecord(id);
   if(!record)throw Error('This project was not found. Create a project before saving.');
   record.snapshot=safe;record.updatedAt=Date.now();
   await putRecord(record);return record;
  });
 }
 async function create(name,snapshot,assignmentKey=''){
  const safe=copy(snapshot);
  return transaction(async()=>{
   const now=Date.now();
   const record={id:makeId(),name:cleanName(name),createdAt:now,updatedAt:now,snapshot:safe,assignmentKey:String(assignmentKey||'').slice(0,100)};
   await putRecord(record);return copy(record);
  });
 }
 async function rename(id,name){
  return transaction(async()=>{
   const record=await getRecord(id);if(!record)throw Error('Project not found');
   record.name=cleanName(name);record.updatedAt=Date.now();await putRecord(record);return copy(record);
  });
 }
 async function remove(id){
  return transaction(async()=>{
   const records=await getAll();
   if(records.length<=1)throw Error('Keep at least one project');
   await deleteRecord(id);
  });
 }
 function select(id){storageSet(META_KEY,id);}
 function state(){return {mode,activeId:activeId()};}
 async function flush(){await queue;}
 window.pythonLabProjects={init,list,get,save,create,rename,remove,select,state,flush};
})();
