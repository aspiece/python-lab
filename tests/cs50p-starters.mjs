import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script,runInNewContext} from 'node:vm';
import {spawnSync} from 'node:child_process';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const librarySource=read('cs50p-starters.js'),gallerySource=read('classroom-templates.js'),html=read('index.html');
new Script(librarySource,{filename:'cs50p-starters.js'});
new Script(gallerySource,{filename:'classroom-templates.js'});

class Element{
 constructor(id=''){this.id=id;this.value='';this.children=[];this._text='';this.className='';this.style={};this.attrs={};this.events={};this.open=false;}
 set textContent(value){this._text=String(value);this.children=[];}
 get textContent(){return this._text||this.children.map(x=>x.textContent).join('');}
 append(...items){this.children.push(...items);}
 setAttribute(name,value){this.attrs[name]=value;}
 addEventListener(name,fn){this.events[name]=fn;}
 click(){this.onclick?.();this.events.click?.();}
 showModal(){this.open=true;}
 close(){this.open=false;}
}
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,new Set(ids).size,'Duplicate HTML IDs');
for(const id of ['templateBtn','templateSearch','templateSetFilter','templateCount','templateGallery','templateClose','templatesDialog']){
 assert(ids.includes(id),'Missing CS50P gallery UI '+id);
}
const elements=Object.fromEntries(ids.map(id=>[id,new Element(id)]));
const document={getElementById:id=>elements[id]||null,createElement:tag=>new Element(tag)};
const window={location:{href:'https://aspiece.github.io/python-lab/'}};
runInNewContext(librarySource,{window});
runInNewContext(gallerySource,{window,document,URL,Math,JSON,prompt:()=>null});

const library=window.pythonLabCS50P,api=window.pythonLabTemplates;
assert(library&&api,'CS50P starter modules missing');
const rows=library.catalog();
assert.equal(rows.length,41,'The official CS50P catalog should contain 41 problems');
assert.deepEqual(Array.from({length:9},(_,n)=>rows.filter(p=>p.set===n).length),[5,5,5,4,6,4,4,5,3]);
assert.equal(new Set(rows.map(x=>x.id)).size,41,'Duplicate template IDs');
const files={};
for(const problem of rows){
 const p=api.get(problem.id);
 assert(p,'Cannot load '+problem.title);
 assert.equal(p.id,problem.id);
 assert.equal(p.entryFile,problem.filename);
 assert.equal(problem.url,'https://cs50.harvard.edu/python/psets/'+problem.set+'/'+p.slug+'/');
 assert(Object.hasOwn(p.files,p.entryFile),'Missing actual editor entry file '+p.entryFile);
 assert(p.files['README.md'].includes(problem.url),'Instructions URL missing from README for '+p.id);
 assert(p.files['README.md'].includes('NOT an official'),'Unsolved/original notice missing for '+p.id);
 assert(p.files['README.md'].includes('## Step-by-step plan'),'No student plan in '+p.id);
 assert(p.files['README.md'].includes('## Check your work'),'No self-check tasks in '+p.id);
 assert(p.files['README.md'].includes('## Words to know'),'Missing easy-to-read word help in '+p.id);
 assert(p.files['README.md'].includes('## Move your code to CS50 Codespaces'),'Missing code transfer steps in '+p.id);
 assert(p.files['README.md'].includes('## Files your program may need'),'Missing extra-file instructions in '+p.id);
 assert(p.files['README.md'].includes('Only send extra files if the official CS50 problem tells you to.'),'Missing submit-only-when-asked rule in '+p.id);
 assert(p.files['README.md'].includes('Add any data or image files your code needs to run.'),'Missing dependent-file transfer step in '+p.id);
 assert(p.files['README.md'].includes('Keep `README.md` in Python Lab.'),'README should stay out of submission for '+p.id);
 assert(p.files['README.md'].includes('You do **not** need to send it to CS50.'),'README submission note missing in '+p.id);
 assert(p.files['README.md'].includes('## What will you make?'),'No plain-language learning goal in '+p.id);
 const readme=p.files['README.md'];
 const lines=readme.split('\n');
 const start=lines.indexOf('## Step-by-step plan'),stop=lines.indexOf('## Check your work');
 const numbered=lines.slice(start+1,stop).filter(line=>/^\d+\. /.test(line));
 assert(numbered.length>=3,'Expected full problem steps in the README for '+p.id);
 for(const line of numbered)assert(line.split(/\s+/).length<=20,'Student plan sentence is too long in '+p.id+': '+line);
 const pythonFiles=Object.keys(p.files).filter(name=>name.endsWith('.py'));
 for(const name of pythonFiles)assert(readme.includes('- `'+name+'`'),'Missing code file '+name+' in README transfer list');
 assert.equal(p.folderName,p.slug,'Folder does not match official problem slug for '+p.id);
 assert(p.files[p.entryFile].includes('# Full problem:')||p.files[p.entryFile].includes('Official instructions:')||p.files[p.entryFile].includes('# Assignment:'),
  'Starter missing official instructions link: '+p.id);
 for(const [name,code] of Object.entries(p.files)){
  if(name.endsWith('.py')){
   assert(code.includes('TODO'),'Starter lacks actionable TODOs: '+p.id+'/'+name);
   assert(code.includes('README.md'),'Python source does not point students to the guide: '+p.id+'/'+name);
   assert(!code.includes('# PLAN YOUR CODE')&&!code.includes('# CHECK YOUR WORK'),'Detailed plan should be in README, not Python source: '+p.id+'/'+name);
   assert(!code.includes('# YOUR MISSION'),'Goal instructions should not take space in source: '+p.id+'/'+name);
   assert(!code.includes('raise NotImplementedError'),'Starter must not raise NotImplementedError: '+p.id+'/'+name);
   assert(!code.includes('Write your own script here'),'Old exception prompt remains: '+p.id+'/'+name);
   files[p.id+'/'+name]=code;
  }
 }
}
for(const id of ['cs50p-5-test_twttr','cs50p-5-test_bank','cs50p-5-test_plates','cs50p-5-test_fuel']){
 const item=api.get(id);
 assert(item.entryFile.startsWith('test_'),'Unit-test set does not open test file: '+id);
 assert(Object.keys(item.files).filter(p=>p.endsWith('.py')).length===2,'Test exercise must include both source and test files: '+id);
}
for(const id of ['cs50p-7-numb3rs','cs50p-7-working','cs50p-7-um','cs50p-8-seasons','cs50p-8-jar']){
 assert(Object.keys(api.get(id).files).some(p=>p.startsWith('test_')),'Expected a pytest starter: '+id);
}
// Verify unsolved structural outlines against the project owner's reference
// while intentionally excluding all private implementation bodies and answers.
const shapes=[
 ['cs50p-0-faces','faces.py',['def convert(s):'],[]],
 ['cs50p-2-twttr','twttr.py',['def is_vowel(letter):'],[]],
 ['cs50p-4-game','game.py',['def get_guess():','def get_level():','def get_number(prompt):'],['import random']],
 ['cs50p-4-figlet','figlet.py',[],['from pyfiglet import Figlet','import sys']],
 ['cs50p-5-test_bank','bank.py',['def value(greeting):'],[]],
 ['cs50p-6-pizza','pizza.py',[],['import csv','from tabulate import tabulate']],
 ['cs50p-6-scourgify','scourgify.py',[],['import csv','import sys']],
 ['cs50p-6-shirt','shirt.py',[],['from PIL import Image, ImageOps']],
 ['cs50p-7-working','working.py',['def convert(s):','def convert_time(t):'],['import re','import sys']],
 ['cs50p-7-response','response.py',[],['import validators']],
 ['cs50p-8-seasons','seasons.py',['def calculate(t0, t1):'],['from datetime import date','import inflect']],
 ['cs50p-8-shirtificate','shirtificate.py',['class PDF(FPDF):','def header(self):'],['from fpdf import FPDF']]
];
for(const [id,filename,signatures,imports] of shapes){
 const code=api.get(id).files[filename];
 assert(code,'Missing '+filename+' in '+id);
 for(const signature of signatures)assert(code.includes(signature),'Missing reference signature '+signature+' in '+id);
 for(const spec of imports)assert(code.includes(spec),'Missing package import '+spec+' in '+id);
 assert(code.includes('TODO'),'Source code must contain an unsolved TODO: '+id);
}
for(const [id,testsExpected] of [
 ['cs50p-5-test_twttr',['test_shorten']],
 ['cs50p-5-test_bank',['test_hello','test_with_h','test_without_h']],
 ['cs50p-5-test_fuel',['test_convert','test_gauge']],
 ['cs50p-7-working',['test_format','test_with_minutes','test_without_minutes']],
 ['cs50p-8-seasons',['test_calculate']],
 ['cs50p-8-jar',['test_init','test_str','test_deposit','test_withdraw']]
]){
 const p=api.get(id);
 const file=Object.entries(p.files).find(([name])=>name.startsWith('test_')&&name.endsWith('.py'));
 assert(file,'Tests file missing in '+id);
 for(const functionName of testsExpected)assert(file[1].includes('def '+functionName+'():'),'Missing test case outline '+functionName);
 assert(!/\bassert\s+(?:True|False|\d)/.test(file[1]),'Do not ship solved test assertions');
}
for(const id of ['cs50p-0-indoor','cs50p-1-deep','cs50p-3-grocery','cs50p-6-lines']){
 const p=api.get(id);
 assert(!p.files[p.entryFile].includes('def main():'),'Reference top-level script became a forced main() template: '+id);
}
const css=read('styles.css');
assert(css.includes('.cs50p-dialog #templateGallery{'),'Missing CS50P layout refresh');
assert(css.includes('grid-template-columns:repeat(2,minmax(0,1fr))'),'Wide screen two-column layout missing');
assert(css.includes('@media(max-width:720px)'),'Compact breakpoint missing');
assert(css.includes('grid-template-columns:minmax(0,1fr)'),'Single-column mobile layout missing');

const indoor=api.get('cs50p-0-indoor');
assert.equal(indoor.folderName,'indoor');
assert.equal(indoor.entryFile,'indoor.py');
assert(indoor.files['indoor.py'].includes('speech = input('),'Indoor should have a useful input starter');
assert(indoor.files['README.md'].includes('## Step-by-step plan'),'Indoor README missing plan');
assert(indoor.files['README.md'].includes('## Check your work'),'Indoor README missing self-checks');
assert(!indoor.files['indoor.py'].includes('# PLAN YOUR CODE'),'Indoor Python file still has long plan');
assert(indoor.files['indoor.py'].split('\n').length<=9,'Indoor Python file has too many comments');
const assetCases=[
 ['cs50p-6-pizza',['sicilian.csv','regular.csv']],
 ['cs50p-6-scourgify',['before.csv']],
 ['cs50p-6-shirt',['shirt.png','muppets.zip']],
 ['cs50p-8-shirtificate',['shirtificate.png']]
];
for(const [id,names] of assetCases){
 const item=api.get(id),readme=item.files['README.md'];
 const found=Array.from(item.extraFiles,file=>file.name);
 assert.deepEqual(found,names,'CS50 dependent file list mismatch: '+id);
 for(const entry of item.extraFiles){
  assert(entry.url.startsWith('https://cs50.harvard.edu/python/2022/psets/'),'External asset URL mismatch for '+id);
  assert(readme.includes(entry.url)&&readme.includes('`'+entry.name+'`'),'Official asset is missing in the student README: '+id+'/'+entry.name);
 }
 assert(readme.includes('Only send extra files'),'Do not encourage submitting all assets in '+id);
}
assert(api.get('cs50p-6-lines').files['README.md'].includes('second `.py` file'),'Lines should tell students to include sample scripts for testing');
assert(api.get('cs50p-6-shirt').files['README.md'].includes('do not need to submit your photos'),'CS50 explicitly exempts test photos');
assert(api.get('cs50p-8-shirtificate').files['README.md'].includes('do not need to submit the PDF'),'CS50 explicitly exempts generated PDFs');
const fuelReadme=api.get('cs50p-5-test_fuel').files['README.md'];
assert(fuelReadme.includes('`fuel.py`')&&fuelReadme.includes('`test_fuel.py`'),'Problem Set 5 needs both Python files');
assert(fuelReadme.includes('NOT an official'),'Need honest student guidance');
const fuelTests=api.get('cs50p-5-test_fuel').files['test_fuel.py'];
assert(fuelTests.includes('import pytest'),'Tests should explicitly import pytest');
assert(fuelTests.includes('pytest.skip('),'Unfinished tests should skip rather than appear to pass');
assert(!fuelTests.includes('raise NotImplementedError'),'Tests must not force the old error');
assert(fuelTests.includes('def test_convert():')&&fuelTests.includes('def test_gauge():'));
const jar=api.get('cs50p-8-jar').files['jar.py'];
for(const name of ['__init__','__str__','deposit','withdraw','capacity','size']){
 assert(jar.includes('def '+name+'('),'Jar class missing '+name);
}
const pythonCheck=[
 'import ast,json,sys',
 'files=json.load(sys.stdin)',
 'bad=[]',
 'for name,source in files.items():',
 '    try: ast.parse(source,filename=name)',
 '    except SyntaxError as exc: bad.append(str(exc))',
 'print("Compiled",len(files),"unsolved Python starter files")',
 'if bad: print("\\n".join(bad),file=sys.stderr); sys.exit(1)'
].join('\n');
const py=spawnSync('python3',['-c',pythonCheck],{input:JSON.stringify(files),encoding:'utf8'});
assert.equal(py.status,0,'Starter Python AST syntax invalid: '+py.stderr);
console.log(py.stdout.trim());

let created=null;api.attach(project=>{created=project;return true;});
const cards=()=>elements.templateGallery.children.filter(item=>item.className==='template-option');
assert.equal(cards().length,41,'Gallery not showing 41 starters');
const headings=elements.templateGallery.children.filter(item=>item.className==='template-set-heading');
assert.equal(headings.length,9,'Problem sets not grouped correctly');
assert.equal(elements.templateSetFilter.children.length,10,'Missing All + nine set filters');
elements.templateSetFilter.value='5';
elements.templateSetFilter.events.change();
assert.equal(cards().length,4,'Problem Set 5 should contain four exercises');
elements.templateSearch.value='fuel';
elements.templateSearch.events.input();
assert.equal(cards().length,1,'Search should isolate the Refueling assignment');
const selected=cards()[0];
assert(selected.children[1].children[0].href.endsWith('/5/test_fuel/'),'Official link mismatch');
selected.children[0].click();
assert.equal(created.id,'cs50p-5-test_fuel');
assert.equal(created.entryFile,'test_fuel.py');
assert.equal(elements.templatesDialog.open,false);
const shared=new URL(api.assignmentUrl('cs50p-5-test_fuel'));
assert.equal(shared.searchParams.get('starter'),'cs50p-5-test_fuel');
assert(shared.searchParams.get('assignment')?.length>=6);
console.log('CS50P catalog, valid Python starter syntax, gallery filters, search and Canvas link checks passed.');
