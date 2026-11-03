import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext,Script} from 'node:vm';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const html=read('index.html'),app=read('app.js'),storeSource=read('project-store.js'),templates=read('classroom-templates.js');
for(const [name,source] of [['app.js',app],['project-store.js',storeSource],['classroom-templates.js',templates]])new Script(source,{filename:name});
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
const backing=new Map();
const localStorage={
 getItem:key=>backing.get(key)||null,
 setItem:(key,val)=>backing.set(key,String(val))
};
const legacy='print("My old homework")';
localStorage.setItem('python-lab-v1',JSON.stringify({
 filename:'main.py',code:legacy,files:{'main.py':legacy},dirs:[],cwd:''
}));
let promptAnswer='Student Project';
let confirmed=true;
class Element{
 constructor(id){
  this.id=id;this.value='';this.children=[];this.hidden=false;this.dataset={};this.style={};
  this.attrs={};this.textContent='';this.parentElement=this;this.className='';this.scrollTop=0;
  this.clientHeight=600;this.clientWidth=800;this.scrollHeight=800;this.selectionStart=0;this.events={};
  this.classList={add(){},remove(){},toggle(){}};
 }
 addEventListener(name,handler){this.events[name]=handler;}
 append(...nodes){this.children.push(...nodes);}
 setAttribute(key,val){this.attrs[key]=val;}
 getBoundingClientRect(){return {height:250};}
 querySelector(){return null;}
 closest(){return null;}
 setPointerCapture(){}
 click(){this.onclick?.();this.events.click?.({target:this});}
 focus(){}
 showModal(){this.open=true;}
 close(){this.open=false;}
}
function createBrowser(search=''){
 const nodes=Object.fromEntries(ids.map(id=>[id,new Element(id)]));
 nodes.output.parentElement=nodes.consoleLayout;
 const document={
  title:'',
  getElementById:id=>nodes[id]??null,
  createElement:tag=>new Element(tag),
  addEventListener(){},
 };
 const window={
  location:{search,href:'https://aspiece.github.io/python-lab/'+search,pathname:'/python-lab/'},
  matchMedia:()=>({matches:false}),
  addEventListener(){}
 };
 const storeContext={window,localStorage,Date,Math,JSON,Promise,console};
 runInNewContext(storeSource,storeContext);
 runInNewContext(templates,{window,document,URL,Math,JSON,prompt:()=>null,console});
 class Worker{
  constructor(){this.calls=[];Worker.current=this;}
  postMessage(msg){this.calls.push(msg);if(msg.type==='init')this.onmessage({data:{type:'ready'}});}
  terminate(){}
 }
 const ctx={window,document,localStorage,Worker,Date,Math,URLSearchParams,
  performance:{now:()=>100},setTimeout:()=>123,clearTimeout(){},console,
  alert:message=>{throw Error('Unexpected alert: '+message);},
  prompt:()=>promptAnswer,confirm:()=>confirmed,innerWidth:1200,innerHeight:800
 };
 runInNewContext(app,ctx,{filename:'app.js'});
 return {nodes,window,document,Worker};
}
const settle=async()=>{for(let i=0;i<8;i++)await new Promise(resolve=>setTimeout(resolve,0));};
const first=createBrowser();
await settle();
const store=first.window.pythonLabProjects;
const migrated=await store.list();
assert.equal(migrated.length,1,'Legacy workspace was not migrated');
assert.equal((await store.get(migrated[0].id)).snapshot.files['main.py'],legacy);
assert(first.document.title.includes('My Python Lab'),'Current project title missing');
assert(first.Worker.current,'Pyodide worker did not start after loading storage');

first.nodes.createProjectBtn.click();
await settle();
const projects=await store.list();
assert.equal(projects.length,2,'New project not created');
const fresh=projects.find(p=>p.name==='Student Project');
assert(fresh,'Student Project name not saved');
assert.equal((await store.get(migrated[0].id)).snapshot.files['main.py'],legacy,'Creating project erased old files');
assert(first.document.title.includes('Student Project'),'Project switch did not update title');

// Reopen the original, preserving the newer project.
first.nodes.projectManagerBtn.click();
await settle();
const row=first.nodes.projectList.children.find(r=>r.children[0].children[0].textContent==='My Python Lab');
assert(row,'Original project missing from project manager');
row.children[0].click();
await settle();
assert.equal(first.document.title.includes('My Python Lab'),true);
assert.equal(first.nodes.fallbackEditor.value,legacy,'Switch did not restore original content');

// Assignment starter URL creates a separate project and deduplicates return visits.
const assignment='?starter=functions-tests&assignment=courseunit42';
const second=createBrowser(assignment);
await settle();
const assignmentRecords=await second.window.pythonLabProjects.list();
const assigned=assignmentRecords.find(p=>p.assignmentKey==='courseunit42');
assert(assigned,'Assignment starter was not created');
const assignedProject=await second.window.pythonLabProjects.get(assigned.id);
assert(assignedProject.snapshot.files['test_main.py'],'Assignment tests missing');
assert(assignedProject.snapshot.files['main.py'],'Assignment starter code missing');
assert.equal(assignedProject.snapshot.filename,'main.py');
const third=createBrowser(assignment);
await settle();
assert.equal((await third.window.pythonLabProjects.list()).length,3,'Reopening assignment created a duplicate');
const share=third.window.pythonLabTemplates.assignmentUrl('loops-lists');
const parsed=new URL(share);
assert.equal(parsed.searchParams.get('starter'),'loops-lists');
assert(parsed.searchParams.get('assignment')?.length>=6,'Assignment link lacks unique key');
assert(!share.includes('print('),'Student source code should never be encoded in a share link');

console.log('Project manager, migration, switching, assignment links and revisit checks passed.');
