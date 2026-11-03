import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script,runInNewContext} from 'node:vm';

const read = path => readFileSync(new URL('../'+path,import.meta.url),'utf8');
const html=read('index.html'), app=read('app.js'), worker=read('python-worker.js'), terminal=read('browser-terminal.js'), smart=read('smart-editor.js');
for(const [path,source] of [['app.js',app],['python-worker.js',worker],['browser-terminal.js',terminal],['smart-editor.js',smart]])new Script(source,{filename:path});
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,new Set(ids).size,'Duplicate HTML IDs');
for(const source of [app,smart])for(const m of source.matchAll(/\$\('([^']+)'\)/g))assert(ids.includes(m[1]),'Unknown HTML ID '+m[1]);

class El{
 constructor(id){this.id=id;this.value='';this.hidden=false;this.children=[];this.dataset={};this.style={};this.attrs={};this.parentElement=this;this.clientHeight=600;this.clientWidth=850;this.scrollTop=0;this.scrollHeight=700;this.selectionStart=0;this.classList={add(){},remove(){},toggle(){}};this.events={};}
 set textContent(v){this._value=String(v);this.children=[];}get textContent(){return this._value??this.children.map(x=>x.textContent||'').join('');}
 append(...a){this.children.push(...a)}addEventListener(k,cb){this.events[k]=cb}setAttribute(k,v){this.attrs[k]=v}querySelector(){return null}closest(){return null}focus(){}setPointerCapture(){}
 click(){this.onclick?.();this.events.click?.({target:this})}getBoundingClientRect(){return {height:210}}
}
const elements=Object.fromEntries(ids.map(id=>[id,new El(id)]));
elements.output.parentElement=elements.consoleLayout;
const document={getElementById:id=>elements[id]??(elements[id]=new El(id)),createElement:tag=>new El(tag),addEventListener(){}};
const listeners={};
const window={matchMedia:()=>({matches:false}),addEventListener:(k,cb)=>{listeners[k]=cb}};
const localStorage={
 saved:null,
 getItem:()=>JSON.stringify({filename:'main.py',code:'name=input("Name: ")\nprint(name)',files:{'main.py':'name=input("Name: ")\nprint(name)','week1/test_bank.py':'assert True'},dirs:['week1']}),
 setItem(k,v){this.saved=JSON.parse(v)}
};
class Worker{
 static current;
 constructor(){Worker.current=this;this.sent=[];}
 postMessage(data){this.sent.push(data);if(data.type==='init')this.onmessage({data:{type:'ready'}})}
 fire(data){this.onmessage({data})}terminate(){}
}
let clock=0;
const scheduled=[];
runInNewContext(smart,{window,document,setTimeout:cb=>{scheduled.push(cb);return scheduled.length;},clearTimeout(){}});
runInNewContext(app,{window,document,localStorage,Worker,performance:{now:()=>++clock*200},setTimeout:()=>1,clearTimeout(){},alert(){},prompt(){return null},confirm:()=>true,innerWidth:1200,innerHeight:800});
const output=[];
window.pythonLabTerminalHost.attach({
 write:value=>output.push(value),
 echoCommand:value=>output.push('CMD '+value),
 setMode:(mode,prompt)=>output.push('MODE '+mode+' '+prompt),
 clear(){},focus(){}
});
elements.runBtn.click();
assert.equal(Worker.current.sent.at(-1).type,'run');
Worker.current.fire({type:'output',text:'Name: '});
Worker.current.fire({type:'needInput'});
window.pythonLabTerminalHost.submit('Alex');
assert.equal(Worker.current.sent.at(-1).stdin,'Alex');
Worker.current.fire({type:'output',text:'Name: '});
Worker.current.fire({type:'output',text:'Hello Alex\n'});
Worker.current.fire({type:'done',success:true});
assert.equal(output.filter(x=>x==='Name: ').length,1,'Repeated prompt');
assert.equal(output.filter(x=>x==='Hello Alex\n').length,1,'Missing response output');
window.pythonLabTerminalHost.submit('cp main.py week1/copy.py');
assert(window.pythonLabWorkspace().files['week1/copy.py']);
window.pythonLabTerminalHost.submit('rm week1/copy.py');
assert(!window.pythonLabWorkspace().files['week1/copy.py']);
listeners.keydown({ctrlKey:true,metaKey:false,altKey:false,shiftKey:false,key:'s',code:'KeyS',preventDefault(){}});
assert.equal(localStorage.saved.filename,'main.py','Save shortcut failed');

const tContainer=new El('browserTerminal'),submitted=[];
tContainer.parentElement={classList:{add(){},remove(){}},addEventListener(){}};
let interrupted=0;
const host={
 attach(adapter){this.adapter=adapter;adapter.setMode('shell','~/python-lab $ ')},
 submit(value){submitted.push(value);this.adapter.setMode('shell','~/python-lab $ ')},
 interrupt(){interrupted++;},
 complete:s=>s==='py'?['python']:[]
};
runInNewContext(terminal,{
 window:{pythonLabTerminalHost:host},
 location:{hostname:'aspiece.github.io',port:''},
 document:{getElementById:()=>tContainer,createElement:tag=>new El(tag)},
 console:{warn(){}}
});
assert(host.adapter,'Editor-style terminal adapter missing');
const terminalEditor=host.adapter.inputElement;
assert(terminalEditor,'Terminal input must be a native editable field');
const press=(key,opts={})=>{
 const event={key,shiftKey:false,ctrlKey:false,metaKey:false,altKey:false,
  isComposing:false,prevented:false,preventDefault(){this.prevented=true},...opts};
 terminalEditor.events.keydown(event);return event;
};
terminalEditor.value='py';terminalEditor.selectionStart=2;terminalEditor.selectionEnd=2;
press('Tab');
assert.equal(terminalEditor.value,'python ','Tab completion failed');
press('Enter');
assert.equal(submitted[0],'python ');
assert.equal(terminalEditor.value,'');
host.adapter.write('Name: ');
host.adapter.setMode('input','Name: ');
assert.equal(tContainer.children[1].children[0].textContent,'Name: ','Input label missing');
terminalEditor.value='Alex';terminalEditor.selectionStart=terminalEditor.selectionEnd=4;
press('Enter');
assert.equal(submitted[1],'Alex');
const historyText=()=>tContainer.children[0].children.map(c=>c.textContent).join('');
assert(historyText().includes('Name: Alex\n'),'Inline input and answer not visible together');
assert.equal((historyText().match(/Name: /g)||[]).length,1,'Input prompt was displayed twice');
host.adapter.write('Age? ');
host.adapter.setMode('input','Age? ');
assert.equal(tContainer.children[1].children[0].textContent,'Age? ','Second input prompt missing');
assert(!historyText().endsWith('Age? '),'Pending prompt should be displayed inline');
terminalEditor.value='18';terminalEditor.selectionStart=terminalEditor.selectionEnd=2;press('Enter');
assert.equal(submitted[2],'18');
assert(historyText().includes('Age? 18\n'),'Second inline answer missing');
host.adapter.setMode('shell','~/python-lab $ ');
terminalEditor.value='copy me';terminalEditor.selectionStart=0;terminalEditor.selectionEnd=4;
const copyKey=press('c',{ctrlKey:true});
assert(!copyKey.prevented,'Ctrl+C with text selected must preserve native copy');
terminalEditor.value='draft';terminalEditor.selectionStart=5;terminalEditor.selectionEnd=5;
const selectAll=press('a',{ctrlKey:true});
assert(!selectAll.prevented,'Native text selection should work');
const paste=press('v',{ctrlKey:true});
assert(!paste.prevented,'Native clipboard paste should work');
const newline=press('Enter',{shiftKey:true});
assert(!newline.prevented,'Shift+Enter should allow editing multiline commands');
assert.equal(submitted.length,3,'Shift+Enter should not submit a command');
terminalEditor.value='first command';terminalEditor.selectionStart=terminalEditor.selectionEnd=13;
press('Enter');
terminalEditor.value='';terminalEditor.selectionStart=terminalEditor.selectionEnd=0;
press('ArrowUp');
assert.equal(terminalEditor.value,'first command','Command history does not work');
host.adapter.clear();assert.equal(tContainer.children[0].children.length,0,'Clear did not reset history');
// Phase 3: the smart editor reports real parser diagnostics returned by the worker.
 reports real parser diagnostics returned by the worker.
const mockCompletion={},markerCalls=[];
const mockMonaco={
 languages:{
  CompletionItemKind:{Keyword:1,Function:2,Variable:3,Snippet:4},
  CompletionItemInsertTextRule:{InsertAsSnippet:4},
  registerCompletionItemProvider:(language,provider)=>{assert.equal(language,'python');mockCompletion.complete=provider;},
  registerHoverProvider:(language,provider)=>{assert.equal(language,'python');mockCompletion.hover=provider;}
 },
 MarkerSeverity:{Error:8},
 editor:{setModelMarkers:(model,source,markers)=>{markerCalls.push({model,source,markers});}}
};
const mockModel={
 getValue:()=>'def add(a, b):\n    return a+b',
 getWordUntilPosition:()=>({startColumn:1,endColumn:4}),
 getWordAtPosition:()=>({word:'print'})
};
const mockEditor={revealLineInCenter(){},setPosition(){},focus(){}};
window.pythonLabSmart.attach({
 editor:mockEditor,monaco:mockMonaco,
 models:new Map([['main.py',mockModel]]),
 getFiles:()=>window.pythonLabWorkspace().files,
 getWorker:()=>Worker.current,
 isReady:()=>true,isBusy:()=>false,
 openFile:()=>{},reveal:()=>{}
});
const completions=mockCompletion.complete.provideCompletionItems(mockModel,{lineNumber:1,column:4}).suggestions;
assert(completions.some(x=>x.label==='print'),'Missing print IntelliSense');
assert(completions.some(x=>x.label==='add'),'Missing project function completion');
assert(completions.some(x=>x.label==='for (snippet)'),'Missing Python snippets');
assert(mockCompletion.hover.provideHover(mockModel,{lineNumber:1,column:1}).contents.some(x=>x.value.includes('print(')),'Missing hover docs');
while(scheduled.length)scheduled.shift()();
const diag=Worker.current.sent.filter(x=>x.type==='diagnose').at(-1);
assert(diag,'No syntax check was scheduled');
Worker.current.fire({type:'diagnostics',id:diag.id,problems:[{file:'main.py',line:2,column:5,endLine:2,endColumn:6,message:'invalid syntax'}]});
assert.equal(elements.problemCount.textContent,'1','Problems badge failed');
assert.equal(elements.problemsList.children.length,1,'Problem list is empty');
assert(markerCalls.at(-1).markers.length===1,'Editor syntax marker was not applied');
Worker.current.fire({type:'diagnostics',id:diag.id-1,problems:[]});
assert.equal(elements.problemCount.textContent,'1','Stale diagnostic result overwrote new data');
window.pythonLabSmart.beginTests();
Worker.current.fire({type:'testResults',tests:[
 {name:'test_one',file:'week1/test_bank.py',line:1,outcome:'passed'},
 {name:'test_two',file:'week1/test_bank.py',line:2,outcome:'failed',details:'assert 1 == 2'}
],exitCode:1});
assert(elements.testsSummary.textContent.includes('1 passed'),'Test summary missing passed result');
assert(elements.testsSummary.textContent.includes('1 failed'),'Test summary missing failed result');
assert.equal(elements.testsList.children.length,2,'Test result list incomplete');
console.log('Workspace, editor-like terminal input, and smart editor smoke checks passed.');
