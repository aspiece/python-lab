import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script,runInNewContext} from 'node:vm';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const html=read('index.html'),source=read('student-tools.js'),css=read('styles.css');
new Script(source,{filename:'student-tools.js'});
for(const id of ['studentToolsBtn','studentToolsDialog','toolsReferenceTab','toolsBackupTab','toolsNetworkTab','toolsReferencePanel','toolsBackupPanel','toolsNetworkPanel','pythonReferenceSearch','pythonReferenceResults','downloadBackupBtn','networkCheckBtn','networkCheckResults','studentToolsClose']){
 assert(html.includes('id="'+id+'"'),'Missing student tool UI '+id);
}
assert(html.includes('student-tools.js?v=2'));
assert(html.includes('styles.css?v=31'));
assert(html.includes('traceChanges'));
assert(css.includes('project-actions-menu'));
assert(css.includes('trace-changes'));
class Element{
 constructor(){this.value='';this.children=[];this.events={};this.hidden=false;this.attrs={};this.textContent='';}
 addEventListener(type,fn){this.events[type]=fn;}
 setAttribute(key,value){this.attrs[key]=value;}
 append(...items){this.children.push(...items);}
 showModal(){this.open=true;}
 close(){this.open=false;}
}
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
const nodes=Object.fromEntries(ids.map(id=>[id,new Element()]));
nodes.currentProjectName.textContent='Student Project';
const doc={getElementById:id=>nodes[id]||null,createElement:()=>new Element()};
const context={window:{pythonLabProjects:{state:()=>({mode:'indexeddb'})},pythonLabWorkspace:()=>({files:{'main.py':'print(1)','README.md':'Read me'},dirs:['assets']})},document:doc,console};
runInNewContext(source,context);
assert(context.window.pythonLabStudentTools,'Student help module missing');
nodes.studentToolsBtn.events.click();
assert(nodes.studentToolsDialog.open,'Help dialog failed to open');
assert(nodes.pythonReferenceResults.children.length>=10,'Python reference has too few topics');
nodes.toolsBackupTab.events.click();
assert.equal(nodes.toolsBackupPanel.hidden,false);
assert.match(nodes.backupStorageInfo.textContent,/IndexedDB/);
nodes.toolsNetworkTab.events.click();
assert.equal(nodes.toolsNetworkPanel.hidden,false);
nodes.studentToolsClose.events.click();
assert.equal(nodes.studentToolsDialog.open,false);
console.log('Student reference, backup and network check controls are wired.');
