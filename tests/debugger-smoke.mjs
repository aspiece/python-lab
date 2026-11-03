import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext,Script} from 'node:vm';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const html=read('index.html'), debug=read('debugger.js'), templates=read('classroom-templates.js'), cs50=read('cs50p-starters.js'), tracer=read('python-tracer.js');
for(const [path,src] of [['debugger.js',debug],['classroom-templates.js',templates],['cs50p-starters.js',cs50],['python-tracer.js',tracer]])new Script(src,{filename:path});
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
for(const source of [debug,templates])for(const match of source.matchAll(/\$\('([^']+)'\)/g)){
 assert(ids.includes(match[1]),'Missing interface element: '+match[1]);
}
class Node{
 constructor(id){this.id=id;this.textContent='';this.value='';this.children=[];this.hidden=false;this.disabled=false;this.style={};this.dataset={};this.events={};this.open=false;this.classList={add(){},remove(){},toggle(){}};}
 addEventListener(type,handler){this.events[type]=handler;}
 append(...items){this.children.push(...items);}
 setAttribute(){}
 focus(){}
 showModal(){this.open=true;}
 close(){this.open=false;}
 click(){this.onclick?.();this.events.click?.();}
}
const elements=Object.fromEntries(ids.map(id=>[id,new Node(id)]));
const document={getElementById:id=>elements[id]??null,createElement:tag=>new Node(tag)};
const window={};
runInNewContext(debug,{window,document});
runInNewContext(cs50,{window});
runInNewContext(templates,{window,document});
let persistCount=0,traceRequest=null,current='main.py',activeModel=null,mouseDown=null;
const allFiles={'main.py':'total = 0\nfor x in range(3):\n    total += x\nprint(total)\n','test_main.py':'assert True'};
const model={
 getValue:()=>allFiles['main.py'],
 deltaDecorations(previous,next){this.decorations=next;return next.map((_,i)=>'d'+i)}
};
const models=new Map([['main.py',model]]);
const monaco={Range:class{constructor(...args){this.coords=args;}},editor:{MouseTargetType:{GUTTER_GLYPH_MARGIN:1,GUTTER_LINE_NUMBERS:2}}};
const editor={
 onMouseDown(fn){mouseDown=fn;},
 revealLineInCenter(){},setPosition(pos){this.position=pos;},focus(){}
};
window.pythonLabDebug.attach({
 editor,monaco,models,breakpoints:{},
 activeFile:()=>current,
 openFile:path=>{current=path;},
 getFiles:()=>allFiles,
 getArguments:()=>['--example'],
 requestTrace:data=>{traceRequest=data;},
 reveal(){},persist(){persistCount++;}
});
assert(mouseDown,'Monaco breakpoint click handler missing');
mouseDown({target:{type:1,position:{lineNumber:2}}});
assert.equal(JSON.stringify(window.pythonLabDebug.serialize()['main.py']),JSON.stringify([2]));
assert(persistCount>0,'Breakpoints not persisted');
assert.equal(model.decorations.length,1);
window.pythonLabDebug.begin();
assert(elements.traceInputsDialog.open,'Debug inputs dialog did not open');
elements.traceInputs.value='Alex\n18';
elements.traceConfirm.click();
assert.equal(traceRequest.filename,'main.py');
assert.equal(traceRequest.inputs.length,2);
assert.equal(traceRequest.args[0],'--example');
assert.equal(elements.traceInputsDialog.open,false);
const frames=[
 {file:'main.py',line:1,depth:0,locals:{},output:''},
 {file:'main.py',line:2,depth:0,locals:{total:'0'},output:''},
 {file:'main.py',line:4,depth:1,locals:{number:'1'},output:''},
 {file:'main.py',line:4,depth:1,locals:{number:'2'},output:''},
 {file:'main.py',line:3,depth:0,locals:{total:'3'},output:''},
 {file:'main.py',line:4,depth:0,locals:{total:'3'},output:'3\n'}
];
window.pythonLabDebug.onResult({type:'traceResults',frames,output:'3\n',error:''});
assert(elements.traceFrameInfo.textContent.includes('1 of 6'));
window.pythonLabDebug.setPosition(1);
window.pythonLabDebug.stepOver();
assert.equal(editor.position.lineNumber,3,'Step Over should skip nested function frames');
window.pythonLabDebug.setPosition(0);
window.pythonLabDebug.continueToBreakpoint();
assert.equal(editor.position.lineNumber,2,'Continue should locate a breakpoint');
assert(elements.traceVariables.children.length>0,'Variables panel empty');
window.pythonLabDebug.abort();
let installed=null;
window.pythonLabTemplates.attach(project=>{installed=project;return true;});
const cards=elements.templateGallery.children.filter(item=>item.className==='template-option');
assert.equal(cards.length,41,'Expected all 41 CS50P starter problems');
const refuel=cards.find(item=>item.children[0].children[0].textContent==='Refueling');
assert(refuel,'Missing Problem Set 5 Refueling');
refuel.children[0].click();
assert(installed.files['fuel.py']&&installed.files['test_fuel.py'],'Unit test starter files missing');
assert(installed.files['README.md'],'Starter instructions missing');
assert.equal(installed.entryFile,'test_fuel.py');
assert.equal(installed.id,'cs50p-5-test_fuel');
console.log('Debugger breakpoints, recorded steps, inputs and classroom templates passed.');
