import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext,Script} from 'node:vm';

const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
const html=read('index.html'),code=read('classroom-templates.js'),app=read('app.js');
new Script(code,{filename:'classroom-templates.js'});
assert(!html.includes('cs50p-starters.js')&&!html.includes('cs50-tools.js'));
assert(!html.includes('cs50SubmissionDialog'));
assert(!html.includes('CS50P Starters'));
assert(!html.includes('cs50ToolsBtn'));
assert(!app.includes('pythonLabCS50Tools'));
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,new Set(ids).size,'Duplicate HTML element IDs');
for(const id of ['templateBtn','templatesDialog','templateSearch','templateCategory','templateGallery','templateCount','templateClose'])
 assert(ids.includes(id),'Missing template UI '+id);

class Element{
 constructor(id){this.id=id;this.children=[];this._text='';this.value='';this.events={};this.className='';this.hidden=false;}
 set textContent(value){this._text=String(value);this.children=[];}
 get textContent(){return this._text;}
 addEventListener(name,fn){this.events[name]=fn;}
 append(...children){this.children.push(...children);}
 showModal(){this.open=true;}
 close(){this.open=false;}
}
const elements=Object.fromEntries(ids.map(id=>[id,new Element(id)]));
const document={getElementById:id=>elements[id]||null,createElement:id=>new Element(id)};
const window={location:{href:'https://aspiece.github.io/python-lab/'}};
const context={window,document,URL,Math,JSON,prompt:()=>null};
runInNewContext(code,context);
const templates=window.pythonLabTemplates;
assert(templates,'Classroom gallery unavailable');
const all=templates.catalog();
assert(all.length>=15,'Expected general examples and tracing activities');
assert(all.every(item=>['start','skills','loops','challenges'].includes(item.category)));
assert.equal(templates.catalog().find(x=>x.id==='hello-world').category,'start');
assert(all.every(a=>!a.id.startsWith('cs50p-')));
assert.equal(templates.get('cs50p-0-indoor'),null,'CS50 lab should not be offered');
assert(templates.get('hello-world').files['main.py']);
assert(templates.get('functions-tests').files['test_main.py']);
assert(templates.get('trace-for-loops').files['README.md']);
for(const slug of ['boss-battle','track-countdown','xp-tracker','beat-counter','loot-scanner','playlist-preview','enemy-waves','drum-machine']){
 const id='trace-'+slug;
 const starter=templates.get(id);
 assert.equal(starter.folderName,id);
 assert.match(starter.files['README.md'],/Change and test/);
 assert.equal(new URL(templates.assignmentUrl(id)).searchParams.get('starter'),id);
}
assert.equal(templates.get('cs50p-style'),null,'Old CS50-themed sample should not appear');

let selected=null;
templates.attach(item=>{selected=item;return true;});
assert.equal(elements.templateGallery.children.length,all.length+4);
const card=elements.templateGallery.children[1];
card.children[0].onclick();
assert.equal(selected.id,'hello-world');
assert.equal(selected.entryFile,'main.py');
const share=templates.assignmentUrl('trace-for-loops');
const link=new URL(share);
assert.equal(link.searchParams.get('starter'),'trace-for-loops');
assert((link.searchParams.get('assignment')||'').length>=6);

elements.templateSearch.value='trace';
elements.templateSearch.events.input();
assert.equal(elements.templateGallery.children.filter(x=>x.className==='template-option').length,4,'Trace search did not filter gallery');
assert.match(elements.templateCount.textContent,/Showing 4 of/);

elements.templateSearch.value='';
elements.templateCategory.value='start';elements.templateCategory.events.change();
assert.equal(elements.templateGallery.children.filter(x=>x.className==='template-option').length,1);
elements.templateCategory.value='all';
elements.templateSearch.value='cs50p';
elements.templateSearch.events.input();
assert.equal(elements.templateGallery.children.length,1,'Missing no-results notice');
assert.match(elements.templateGallery.children[0].textContent,/No matching templates/);
console.log('General Python templates remain available; all 41 CS50P lab entries are absent.');
