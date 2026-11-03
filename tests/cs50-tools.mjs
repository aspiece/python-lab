import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext,Script} from 'node:vm';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const html=read('index.html'),catalogSource=read('cs50p-starters.js'),toolSource=read('cs50-tools.js');
new Script(toolSource,{filename:'cs50-tools.js'});
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
for(const id of ['cs50ToolsBtn','cs50SubmissionDialog','cs50AssignmentSelect','cs50CheckCommand','cs50SubmitCommand',
 'cs50FilesList','cs50PackageBtn','cs50PackageStatus','cs50InstallLibraryBtn','cs50CloseBtn']){
 assert(ids.includes(id),'Missing CS50 handoff control '+id);
}
class Node{
 constructor(id=''){
  this.id=id;this.children=[];this.textContent='';this.value='';this.events={};this.disabled=false;
  this.style={};this.open=false;
 }
 append(...children){this.children.push(...children);}
 addEventListener(event,handler){this.events[event]=handler;}
 click(){this.onclick?.();this.events.click?.();}
 showModal(){this.open=true;}
 close(){this.open=false;}
}
const elements=Object.fromEntries(ids.map(id=>[id,new Node(id)]));
const document={getElementById:id=>elements[id]||null,createElement:tag=>new Node(tag)};
const window={};
runInNewContext(catalogSource,{window});
runInNewContext(toolSource,{window,document,console});
const api=window.pythonLabCS50Tools;
assert(api,'CS50 handoff unavailable');
const catalog=window.pythonLabCS50P;
const find=id=>catalog.get(id);
assert.equal(api.submissionSlug(find('cs50p-0-indoor')),'cs50/problems/2022/python/indoor');
assert.equal(api.submissionSlug(find('cs50p-5-test_fuel')),'cs50/problems/2022/python/tests/fuel');
assert.equal(api.submissionSlug(find('cs50p-8-jar')),'cs50/problems/2022/python/jar');
assert.equal(api.commands(find('cs50p-0-indoor')).submit,'submit50 cs50/problems/2022/python/indoor');

const data={
 filename:'indoor-2/indoor.py',cwd:'indoor-2',
 files:{
  'main.py':'print("another project")',
  'indoor/indoor.py':'print("older attempt")',
  'indoor-2/indoor.py':'print("newer attempt")',
  'indoor-2/README.md':'# official instructions and notes',
  'other/task.py':'private other homework'
 }
};
api.attach({workspace:()=>data,projectName:()=> 'My Python Lab',installLibrary:()=>{}});
const indoor=find('cs50p-0-indoor');
const files=api.submissionFiles(indoor);
assert.equal(files['indoor.py'],'print("newer attempt")','Submission picked wrong duplicate project folder');
assert(!Object.values(files).some(s=>s.includes('private other homework')||s.includes('older attempt')),
 'Submission leaked work from another folder');

api.show();
assert(elements.cs50SubmissionDialog.open,'Handoff dialog was not opened');
assert.equal(elements.cs50AssignmentSelect.children.length,41,'Not all assignments are available');
assert.equal(elements.cs50AssignmentSelect.value,'cs50p-0-indoor','Selected wrong active problem');
assert.equal(elements.cs50PackageBtn.disabled,false,'Valid assignment should permit ZIP export');
assert(elements.cs50FilesList.textContent.includes('indoor/indoor.py'));
assert(!elements.cs50FilesList.textContent.includes('other/task.py'));
assert.equal(elements.cs50InstructionsLink.href,'https://cs50.harvard.edu/python/psets/0/indoor/');
assert(elements.cs50SubmitCommand.textContent.includes('submit50 cs50/problems/2022/python/indoor'));
assert(!toolSource.includes('fetch('),'The handoff must not upload student files via network');
assert(!toolSource.includes('new WebSocket'),'The handoff must not open a WebSocket');
assert(!toolSource.includes('github.com/me50/'),'The handoff must not forge a GitHub submission');

data.filename='main.py';data.cwd='';
data.files={'main.py':'print("unrelated")'};
elements.cs50AssignmentSelect.events.change();
assert.equal(elements.cs50PackageBtn.disabled,true,'Missing assignment files must not be packaged');
assert(elements.cs50FilesList.textContent.includes('No matching files'));

let requested=0;
api.attach({workspace:()=>data,projectName:()=> 'My Python Lab',installLibrary:()=>{requested++;}});
elements.cs50InstallLibraryBtn.click();
assert.equal(requested,1,'Library install request was not forwarded');
api.packageResult({success:false,error:'Unsupported WASM dependency'});
assert(elements.cs50InstallStatus.textContent.includes('Unsupported WASM dependency'),'Installation failure was hidden');
console.log('CS50 submission slug, selection, ZIP isolation, UI, and truthful installation status passed.');
