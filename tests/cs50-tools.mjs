import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext,Script} from 'node:vm';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const html=read('index.html'),catalogSource=read('cs50p-starters.js'),toolSource=read('cs50-tools.js');
new Script(toolSource,{filename:'cs50-tools.js'});
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
for(const id of ['cs50ToolsBtn','cs50SubmissionDialog','cs50AssignmentSelect','cs50CheckCommand','cs50SubmitCommand',
 'cs50FilesList','cs50ExtraFilesList','cs50PackageStatus','cs50LibraryStatus','cs50CloseBtn']){
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
assert(!Object.hasOwn(files,'README.md'),'The Python Lab guide must not be in the CS50 file list');
assert(!Object.values(files).some(s=>s.includes('private other homework')||s.includes('older attempt')),
 'Submission leaked work from another folder');

api.show();
assert(elements.cs50SubmissionDialog.open,'Handoff dialog was not opened');
assert.equal(elements.cs50AssignmentSelect.children.length,41,'Not all assignments are available');
assert.equal(elements.cs50AssignmentSelect.value,'cs50p-0-indoor','Selected wrong active problem');
assert(elements.cs50PackageStatus.textContent.includes('Do not send README.md'),'CS50 panel should tell students to keep README');
assert(!html.includes('cs50PackageBtn'),'CS50 ZIP button should be removed');
assert(elements.cs50FilesList.textContent.includes('indoor/indoor.py'));
assert(!elements.cs50FilesList.textContent.includes('other/task.py'));
assert(!elements.cs50FilesList.textContent.includes('README.md'),'README must never appear among transfer files');
assert(elements.cs50ExtraFilesList.textContent.includes('No extra CS50 sample files'),'Indoor should have no listed CS50 sample files');
assert(!elements.cs50ExtraFilesList.textContent.includes('README.md'),'Help file must not appear among dependent assets');
assert.equal(elements.cs50InstructionsLink.href,'https://cs50.harvard.edu/python/psets/0/indoor/');
assert(elements.cs50SubmitCommand.textContent.includes('submit50 cs50/problems/2022/python/indoor'));
assert(!toolSource.includes('JSZip'),'CS50 ZIP exports should no longer be offered');
assert(!toolSource.includes('fetch('),'The handoff must not upload student files via network');
assert(!toolSource.includes('new WebSocket'),'The handoff must not open a WebSocket');
assert(!toolSource.includes('github.com/me50/'),'The handoff must not forge a GitHub submission');

// Testing problems may need two Python files, but never the help sheet.
data.filename='test_fuel/test_fuel.py';data.cwd='test_fuel';
data.files={
 'test_fuel/fuel.py':'def convert(fraction): pass',
 'test_fuel/test_fuel.py':'def test_convert(): pass',
 'test_fuel/README.md':'# Help sheet'
};
const testingFiles=api.submissionFiles(find('cs50p-5-test_fuel'));
assert.equal(Object.keys(testingFiles).length,2,'Refueling should list only its two Python files');
assert(Object.hasOwn(testingFiles,'fuel.py')&&Object.hasOwn(testingFiles,'test_fuel.py'));
assert(!Object.hasOwn(testingFiles,'README.md'));
// Show verified CS50 asset names for problems that need extra files to run.
elements.cs50AssignmentSelect.value='cs50p-6-pizza';
elements.cs50AssignmentSelect.events.change();
assert(elements.cs50ExtraFilesList.textContent.includes('sicilian.csv'),'Pizza must warn about the menu CSV');
assert(elements.cs50ExtraFilesList.textContent.includes('regular.csv'),'Pizza must warn about the other menu CSV');
assert(elements.cs50ExtraFilesList.textContent.includes('Only submit them if CS50 asks'),'Testing files are not always required submissions');
elements.cs50AssignmentSelect.value='cs50p-6-shirt';
elements.cs50AssignmentSelect.events.change();
assert(elements.cs50ExtraFilesList.textContent.includes('shirt.png'),'P-Shirt must warn about its required image');
assert(elements.cs50ExtraFilesList.textContent.includes('muppets.zip'),'P-Shirt must note the sample photos');
elements.cs50AssignmentSelect.value='cs50p-8-shirtificate';
elements.cs50AssignmentSelect.events.change();
assert(elements.cs50ExtraFilesList.textContent.includes('shirtificate.png'),'Shirtificate must note the shirt image');

elements.cs50AssignmentSelect.value='cs50p-5-test_fuel';
elements.cs50AssignmentSelect.events.change();
assert(elements.cs50FilesList.textContent.includes('test_fuel/fuel.py'));
assert(elements.cs50FilesList.textContent.includes('test_fuel/test_fuel.py'));
assert(!elements.cs50FilesList.textContent.includes('README.md'));

data.filename='main.py';data.cwd='';
data.files={'main.py':'print("unrelated")'};
elements.cs50AssignmentSelect.events.change();
assert(elements.cs50PackageStatus.textContent.includes('No Python files found'),'Missing code files should be explained');
assert(elements.cs50FilesList.textContent.includes('No matching files'));

assert(!html.includes('id="cs50InstallLibraryBtn"'),'The obsolete manual install control is still visible');
assert(!toolSource.includes('installLibrary?.('),'The tools UI must not request manual installation');
api.packageResult({success:true,automatic:true});
assert(elements.cs50LibraryStatus.textContent.includes('loaded automatically'),'Automatic CS50 preload success is not shown');
api.packageResult({success:false,automatic:true,error:'Unsupported WASM dependency'});
assert(elements.cs50LibraryStatus.textContent.includes('Unsupported WASM dependency'),'CS50 preload failure is hidden');
assert(elements.cs50LibraryStatus.textContent.includes('Regular Python remains available'),'Fallback notice is missing');
console.log('CS50 handoff lists only the Python files needed, not README, and keeps a clear status.');
