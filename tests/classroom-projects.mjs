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

// Generic templates still work without CS50P labs and do not overwrite other files.
const starterCards=first.nodes.templateGallery.children.filter(item=>item.className==='template-option');
const helloCard=starterCards.find(item=>item.children[0].children[0].textContent==='Hello, Python!');
assert(helloCard,'General Python template missing');
assert.equal(first.window.pythonLabTemplates.catalog().length,21);
assert(first.window.pythonLabTemplates.catalog().every(t=>!t.id.startsWith('cs50p-')),
 'CS50 problem-set lab leaked into general starter gallery');
helloCard.children[0].click();
const afterStarter=first.window.pythonLabWorkspace();
assert.equal(afterStarter.filename,'hello-world/main.py');
assert(afterStarter.files['hello-world/main.py']);
assert.equal(afterStarter.files['main.py'],legacy,'Template overwritten the original student code');
helloCard.children[0].click();
const afterDuplicate=first.window.pythonLabWorkspace();
assert.equal(afterDuplicate.filename,'hello-world-2/main.py','Repeat template should use a safe -2 folder');
assert(afterDuplicate.files['hello-world/main.py'],'First template lost');
assert.equal(afterDuplicate.files['main.py'],legacy,'Repeat template overwrote student work');

// Shared Canvas links for general templates remain useful.
assert(first.window.pythonLabTemplates.get('functions-tests')?.files['test_main.py']);
assert(first.window.pythonLabTemplates.get('trace-for-loops')?.files['README.md']);
assert.equal(first.window.pythonLabTemplates.get('cs50p-0-indoor'),null,
 'Removed CS50P starter should not create a new lab');

const assignment='?starter=trace-for-loops&assignment=courseunit42';
const second=createBrowser(assignment);
await settle();
const assignmentRecords=await second.window.pythonLabProjects.list();
const assigned=assignmentRecords.find(p=>p.assignmentKey==='courseunit42');
assert(assigned,'General tracing assignment starter was not created');
const assignedProject=await second.window.pythonLabProjects.get(assigned.id);
assert(assignedProject.snapshot.files['main.py'],'Tracing starter code missing');
assert(assignedProject.snapshot.files['README.md'],'Tracing guide missing');
assert.equal(assignedProject.snapshot.filename,'main.py');
assert.deepEqual(Array.from(assignedProject.snapshot.openTabs),['README.md','main.py']);
assert.equal(second.nodes.starterGuide.hidden,false);
assert.equal(second.nodes.starterGuide.children.at(-2).src,'assets/loop-guides/trace-for-loops.png');
assert.equal(assigned.name,'trace-for-loops','Canvas tracing project name mismatch');
const third=createBrowser(assignment);
await settle();
assert.equal((await third.window.pythonLabProjects.list()).length,3,
 'Reopening an existing assignment created a duplicate');
const share=third.window.pythonLabTemplates.assignmentUrl('functions-tests');
const parsed=new URL(share);
assert.equal(parsed.searchParams.get('starter'),'functions-tests');
assert(parsed.searchParams.get('assignment')?.length>=6);
assert(!share.includes('print('),'Student source code should never be encoded in a link');
assert(!html.includes('cs50p-starters.js')&&!html.includes('cs50SubmissionDialog'),
 'The HTML must not load the removed labs or handoff dialog');

console.log('General templates, saved project migration, file preservation and classroom links passed.');
