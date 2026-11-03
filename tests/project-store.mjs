import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext,Script} from 'node:vm';

const source=readFileSync(new URL('../project-store.js',import.meta.url),'utf8');
new Script(source,{filename:'project-store.js'});

function browserStorage(){
 const values=new Map();
 return {
  getItem:key=>values.get(key)||null,
  setItem:(key,value)=>{values.set(key,String(value));},
  values
 };
}
function fakeIndexedDB(){
 const records=new Map();
 let upgraded=false;
 const database={
  objectStoreNames:{contains:()=>upgraded},
  createObjectStore(){upgraded=true;},
  transaction(){
   const tx={oncomplete:null,onerror:null,onabort:null};
   tx.objectStore=()=>({
    get:key=>request(()=>records.get(key)),
    getAll:()=>request(()=>[...records.values()]),
    put:value=>request(()=>{records.set(value.id,structuredClone(value));return value.id;}),
    delete:key=>request(()=>records.delete(key))
   });
   function request(action){
    const req={onsuccess:null,onerror:null,result:undefined};
    queueMicrotask(()=>{try{req.result=action();req.onsuccess?.();tx.oncomplete?.();}
     catch(error){req.error=error;req.onerror?.();tx.onerror?.();}});
    return req;
   }
   return tx;
  }
 };
 return {
  records,
  open(){
   const req={result:database,onsuccess:null,onerror:null,onblocked:null,onupgradeneeded:null};
   queueMicrotask(()=>{if(!upgraded)req.onupgradeneeded?.();req.onsuccess?.();});
   return req;
  }
 };
}
function makeContext(storage,idb){
 const window={};
 runInNewContext(source,{
  window,localStorage:storage,indexedDB:idb,
  crypto:{randomUUID:()=>String(Math.random()).slice(2)},
  Date,Math,JSON,Promise,console,setTimeout,clearTimeout
 });
 return window.pythonLabProjects;
}
const legacy={
 filename:'main.py',code:'print("legacy")',files:{'main.py':'print("legacy")'},
 dirs:[],cwd:'',openTabs:['main.py'],debugBreakpoints:{'main.py':[2]}
};

for(const backend of ['indexeddb','localStorage']){
 const local=browserStorage(),idb=backend==='indexeddb'?fakeIndexedDB():undefined;
 const store=makeContext(local,idb);
 const start=await store.init(legacy);
 assert.equal(start.mode,backend);
 assert.equal(start.project.snapshot.files['main.py'],'print("legacy")','Legacy migration failed');
 assert.equal((await store.list()).length,1);
 const first=start.project.id;
 const second=await store.create('Loop Practice',{
  filename:'main.py',files:{'main.py':'print(1)'},dirs:[],cwd:''
 },'assignment-abc');
 assert.notEqual(second.id,first);
 await store.save(second.id,{
  filename:'main.py',files:{'main.py':'print(2)'},dirs:[],cwd:''
 });
 await store.rename(second.id,'My Loops');
 store.select(second.id);
 assert.equal((await store.get(second.id)).snapshot.files['main.py'],'print(2)');
 assert.equal((await store.list()).length,2);
 const reopened=makeContext(local,idb);
 const loaded=await reopened.init({filename:'other.py',files:{'other.py':'print("ignored")'}});
 assert.equal(loaded.project.id,second.id,'Project selection not restored');
 assert.equal(loaded.project.name,'My Loops');
 assert.equal(loaded.project.snapshot.files['main.py'],'print(2)');
 assert.equal((await reopened.list()).length,2,'Projects lost on reload');
 await reopened.remove(first);
 assert.equal((await reopened.list()).length,1);
 await assert.rejects(()=>reopened.remove(second.id),/at least one project/);
 console.log(backend+' project persistence, migration, isolation and reopening passed.');
}
