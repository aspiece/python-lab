import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script,runInNewContext} from 'node:vm';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const html=read('index.html'),app=read('app.js');
new Script(app,{filename:'app.js'});
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert(!ids.includes('downloadProjectBtn')&&!ids.includes('downloadSubmissionBtn')&&!ids.includes('saveBtn'),'ZIP or file toolbar download should be removed');
assert(ids.includes('downloadContextBtn'),'Explorer Download File action missing');
class El {
 constructor(id){this.id=id;this.value='';this._text='';this.children=[];this.dataset={};this.style={};this.events={};this.hidden=false;this.parentElement=this;this.clientHeight=500;this.scrollHeight=500;this.scrollTop=0;this.classList={add(){},remove(){},toggle(){}};this.selectionStart=0;}
 set textContent(v){this._text=String(v);this.children=[];}
 get textContent(){return this._text||this.children.map(c=>c.textContent).join('');}
 append(...x){this.children.push(...x);}
 addEventListener(k,fn){this.events[k]=fn;}
 setAttribute(){}
 querySelector(){return null;}
 closest(){return null;}
 focus(){}
 click(){this.events.click?.({target:this});this.onclick?.();}
 remove(){}
 getBoundingClientRect(){return {height:210};}
}
const elements=Object.fromEntries(ids.map(id=>[id,new El(id)]));
elements.output.parentElement=elements.consoleLayout;
const downloads=[];
const document={getElementById:id=>elements[id]||null,createElement:tag=>{
 const el=new El(tag);
 if(tag==='a')el.click=()=>downloads.push({name:el.download,blob:downloadBlob});
 return el;
},body:{append(){}},addEventListener(){}};
const window={addEventListener(){},matchMedia:()=>({matches:false})};
const source={
 filename:'main.py',code:'print("root")',
 files:{'main.py':'print("root")','unit/test_bank.py':'assert True','unit/program.py':'print("unit")'},
 dirs:['unit'],cwd:''
};
const localStorage={getItem:()=>JSON.stringify(source),setItem(){}};
let downloadBlob=null;
const urlAPI={createObjectURL:blob=>{downloadBlob=blob;return 'blob:mock';},revokeObjectURL(){}};
class Worker{
 static current;
 constructor(){this.sent=[];Worker.current=this;}
 postMessage(data){this.sent.push(data);if(data.type==='init')this.onmessage({data:{type:'ready'}});}
 fire(data){this.onmessage({data});}
 terminate(){}
}
let clock=0;
runInNewContext(app,{window,document,localStorage,Worker,URL:urlAPI,Blob,performance:{now:()=>++clock*100},
 setTimeout:()=>123,clearTimeout(){},console,alert:msg=>{throw Error('Alert: '+msg);},prompt:()=>null,confirm:()=>true,innerWidth:1200,innerHeight:800});
const host=window.pythonLabTerminalHost;
const shell=command=>{assert.equal(host.state().mode,'shell','Shell unavailable before '+command);host.submit(command);};
const snapshot=()=>window.pythonLabWorkspace();
const log=()=>elements.output.textContent;
const finish=()=>Worker.current.fire({type:'done',success:true});

// Check the simulated shell's advertised filesystem and navigation commands.
shell('help');
assert(log().includes('Browser commands:'));
shell('whoami');assert(log().includes('student'));
shell('pwd');assert(log().includes('/home/pyodide'));
shell('ls');assert(log().includes('main.py')&&log().includes('unit/'));
shell('dir unit');assert(log().includes('test_bank.py'));
shell('tree');assert(log().includes('program.py'));
shell('echo "hello world"');assert(log().includes('hello world'));
shell('mkdir course');
shell('mkdir -p "course/week 0"');
assert(snapshot().dirs.includes('course/week 0'));
shell('cd "course/week 0"');
assert.equal(snapshot().cwd,'course/week 0');
shell('pwd');assert(log().includes('/home/pyodide/course/week 0'));
shell('touch "first file.py"');
assert.equal(snapshot().files['course/week 0/first file.py'],'');
shell('touch "first file.py"');
shell('cp "first file.py" "copy file.py"');
assert(Object.hasOwn(snapshot().files,'course/week 0/copy file.py'));
shell('mv "copy file.py" "renamed file.py"');
assert(Object.hasOwn(snapshot().files,'course/week 0/renamed file.py'));
assert(!Object.hasOwn(snapshot().files,'course/week 0/copy file.py'));
shell('mkdir sub');
shell('cp "renamed file.py" sub');
assert(Object.hasOwn(snapshot().files,'course/week 0/sub/renamed file.py'));
shell('mv "first file.py" sub');
assert(Object.hasOwn(snapshot().files,'course/week 0/sub/first file.py'));
shell('rm "renamed file.py"');
assert(!Object.hasOwn(snapshot().files,'course/week 0/renamed file.py'));
shell('rm "sub/first file.py"');
shell('rm "sub/renamed file.py"');
shell('rmdir sub');
assert(!snapshot().dirs.includes('course/week 0/sub'));
shell('cd ..');assert.equal(snapshot().cwd,'course');
shell('cd /home/pyodide');assert.equal(snapshot().cwd,'');
shell('cd "~/python-lab/course"');assert.equal(snapshot().cwd,'course');
shell('cd /');assert.equal(snapshot().cwd,'');
shell('cat main.py');assert(log().includes('print("root")'));
shell('type unit/program.py');assert(log().includes('print("unit")'));
shell('cat main.py unit/program.py');assert(log().includes('print("unit")'));
shell('python3 --version');assert(log().includes('Python (Pyodide browser runtime)'));
shell('python --version');assert(log().includes('Python (Pyodide browser runtime)'));
shell('pip list');assert(log().includes('Full pip listing is unavailable'));
shell('pip install cs50');assert(log().includes('automatically'));
shell('check50 cs50/problems/2022/python/indoor');assert(log().includes('cannot submit or check'));
shell('submit50 cs50/problems/2022/python/indoor');assert(log().includes('cannot submit or check'));

// Ensure invalid operations do not mutate project storage.
shell('mkdir main.py');assert(!snapshot().dirs.includes('main.py'));
shell('touch course');assert(!Object.hasOwn(snapshot().files,'course'));
shell('mkdir -p "main.py/nested"');assert(!snapshot().dirs.includes('main.py/nested'));
shell('cd does-not-exist');assert.equal(snapshot().cwd,'');
shell('python missing.py');assert(log().includes('cannot open file'));
shell('unknown-command');assert(log().includes('command not supported'));
shell('echo "unterminated');assert(log().includes('Unclosed quote'));

// The worker receives code, correct working folder and argument values.
shell('python -c "print(\\"hello, Python\\")"');
assert.equal(Worker.current.sent.at(-1).code,'print("hello, Python")');
finish();
shell('cd unit');
shell('python3 program.py --mode demo');
const execution=Worker.current.sent.at(-1);
assert.equal(execution.filename,'unit/program.py','Relative python3 path was not resolved against cwd');
assert.equal(execution.cwd,'unit');
assert.equal(execution.args.join(','),'--mode,demo');
finish();
shell('pytest -q');
const pytestMessage=Worker.current.sent.at(-1);
assert.equal(pytestMessage.purpose,'tests');
assert.equal(pytestMessage.testTargets.join(','),'unit/test_bank.py','pytest must not run unrelated assignments');
finish();
shell('python -m pytest test_bank.py');
assert.equal(Worker.current.sent.at(-1).testTargets.join(','),'unit/test_bank.py');
finish();
shell('pytest --badflag');assert(log().includes('unsupported option'));
shell('pytest missing_test.py');assert(log().includes('no tests found'));
shell('cls');assert(!log().includes('unsupported option'));

// Right-click on a nested file while a different file is open.
const selected=elements.fileList.children.find(row=>row.title==='unit/program.py');
assert(selected,'Nested Python file missing from Explorer');
selected.events.contextmenu({preventDefault(){},clientX:120,clientY:125});
assert.equal(elements.fileContextMenu.dataset.path,'unit/program.py');
assert.equal(elements.downloadContextBtn.hidden,false);
elements.fileContextMenu.events.click({target:{closest:()=>({dataset:{action:'download'}})}});
assert.equal(downloads.at(-1).name,'program.py','Download used full path as filename');
assert.equal(await downloads.at(-1).blob.text(),'print("unit")','Downloaded wrong file content');
const folder=elements.fileList.children.find(row=>row.title==='unit');
assert(folder,'Folder missing in Explorer');
folder.events.contextmenu({preventDefault(){},clientX:120,clientY:125});
assert.equal(elements.downloadContextBtn.hidden,true,'Folder should not show Download File');
assert(!html.includes('id="cs50PackageBtn"'),'CS50 ZIP export button should be removed');
console.log('CLI commands, quoted names, folders, pytest targets, and right-click file download passed.');
