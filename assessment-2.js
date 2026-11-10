(() => {
'use strict';
const $ = id => document.getElementById(id);
const activities = {
 gaming:{name:'Gaming — Score Tracker',file:'game_tracker.py',inputs:[80,90,95],classification:'Pro',starter:`# Gaming: Player Score Tracker
# Read README.md for instructions.
name = input("Enter gamer tag: ").strip()
total = 0
for round_number in range(3):
    score = int(input("Enter round score: "))
    # TODO 1: Update total.

# TODO 2: Write if, elif, and else to set rank.
rank = ""
print("Player:", name)
print("Total:", total)
print("Rank:", rank)
`},
 music:{name:'Music — Listening Tracker',file:'music_tracker.py',inputs:[45,40,50],classification:'Superfan',starter:`# Music: Listening Tracker
# Read README.md for instructions.
name = input("Enter playlist name: ").strip()
total = 0
for session in range(3):
    minutes = int(input("Enter session minutes: "))
    # TODO 1: Update total.

# TODO 2: Write if, elif, and else to set level.
level = ""
print("Playlist:", name)
print("Total minutes:", total)
print("Level:", level)
`}
};
const state={theme:'gaming',pred:['','',''],actual:['','',''],locked:false,compared:false,reflection:'',started:false,lockedAt:''};
let host=null;
const key='python-lab-assessment-2';
try {Object.assign(state,JSON.parse(localStorage.getItem(key))||{});}catch{}
const save=()=>localStorage.setItem(key,JSON.stringify(state));
function element(tag,text){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;}
function button(label,fn){const b=element('button',label);b.type='button';b.onclick=fn;return b;}
function show(){render();const d=$('assessmentDialog');if(d&&!d.open)d.showModal();}
function render(){
 const root=$('assessmentContent');if(!root)return;root.replaceChildren();
 const info=activities[state.theme],totals=info.inputs.map((_,i)=>info.inputs.slice(0,i+1).reduce((a,b)=>a+b,0));
 const choices=element('div');choices.style.cssText='display:flex;gap:12px;flex-wrap:wrap;margin:12px 0';
 for(const [id,a] of Object.entries(activities)){
  const b=button(a.name,()=>{if(state.locked)return;state.theme=id;state.pred=['','',''];state.actual=['','',''];save();render();});
  b.disabled=state.locked;b.style.cssText='padding:16px;min-width:190px;border:2px solid '+(id===state.theme?'#5b9df6':'#777')+';border-radius:12px';
  choices.append(b);
 }root.append(choices);
 const start=button('Open '+info.name+' starter',()=>{
  if(!host?.install)return alert('Python Lab is still loading.');
  const readme='# '+info.name+'\\n\\nComplete the accumulator and the if/elif/else conditions. See the assessment instructions in the assignment README.\\n\\nGaming: Pro >= 250, Skilled 150-249, Beginner below 150.\\nMusic: Superfan >= 120, Regular 60-119, Casual below 60.\\n\\nPredict the three running totals before using Debug Trace. Return to Assessment to lock them.\\n';
  if(host.install({id:'assessment-2-'+state.theme,folderName:'assessment-2-'+state.theme,entryFile:info.file,files:{[info.file]:info.starter,'README.md':readme}})){state.started=true;save();$('assessmentDialog').close();}
 });root.append(start);
 root.append(element('h4','Predict before debugging'));
 const table=element('table');table.style.width='100%';const header=element('tr');['Iteration','Value entered','Predicted total',...(state.locked?['Observed total']:[])].forEach(x=>header.append(element('th',x)));table.append(header);
 for(let i=0;i<3;i++){const tr=element('tr');tr.append(element('td',String(i+1)),element('td',String(info.inputs[i])));
  const td=element('td'),input=element('input');input.type='number';input.value=state.pred[i];input.disabled=state.locked;input.setAttribute('aria-label','Predicted total iteration '+(i+1));input.style.width='90px';input.oninput=()=>{state.pred[i]=input.value;save();};td.append(input);tr.append(td);
  if(state.locked){const observed=element('td'),actual=element('input');actual.type='number';actual.value=state.actual[i];actual.style.width='90px';actual.setAttribute('aria-label','Observed total iteration '+(i+1));actual.oninput=()=>{state.actual[i]=actual.value;save();};observed.append(actual);tr.append(observed);}table.append(tr);
 }root.append(table);
 if(!state.locked)root.append(button('Lock predictions before Debug Trace',()=>{if(state.pred.some(x=>x.trim()===''||!Number.isFinite(Number(x))))return alert('Enter all three predictions.');state.locked=true;state.lockedAt=new Date().toISOString();save();render();}));
 else {root.append(element('p','Predictions locked at '+state.lockedAt+'. Use Debug Trace, then enter the observed totals.'));root.append(button('Compare results',()=>{if(state.actual.some(x=>x.trim()===''))return alert('Enter the three observed values.');state.compared=true;save();render();}));
 if(state.compared)root.append(element('p','Predictions matching expected totals: '+state.pred.filter((x,i)=>Number(x)===totals[i]).length+' / 3.'));}
 const label=element('label','Reflection: What did you notice about your running total?');root.append(label);
 const reflection=element('textarea');reflection.rows=2;reflection.style.width='100%';reflection.value=state.reflection;reflection.oninput=()=>{state.reflection=reflection.value;save();};root.append(reflection);
 root.append(button('Download Assessment ZIP',async()=>{
  if(!window.JSZip)return alert('ZIP library is not available.');
  if(!state.locked&&!confirm('Predictions are not locked. Download incomplete assessment anyway?'))return;
  if(!state.compared&&!confirm('Trace comparison is incomplete. Download anyway?'))return;
  const files=host?.getFiles?.()||{},name=info.file;
  const matching=Object.keys(files).filter(x=>x.endsWith('/'+name)||x===name);
  const path=matching.find(x=>x.includes('assessment-2-'+state.theme))||matching[0];
  if(!path)return alert('Open the starter and complete your Python program first.');
  const zip=new JSZip();zip.file(name,files[path]);
  const trace=['Python Assessment 2','Theme: '+info.name,'Predictions locked: '+(state.lockedAt||'Not locked'),'','Iteration | Input | Predicted | Observed | Expected',...info.inputs.map((v,i)=>[i+1,v,state.pred[i]||'(blank)',state.actual[i]||'(blank)',totals[i]].join(' | ')),'','Reflection: '+(state.reflection||'(not completed)')].join('\\n');
  zip.file('trace_results.txt',trace);
  const blob=await zip.generateAsync({type:'blob'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='python_assessment_2_'+state.theme+'.zip';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }));
}
function attach(h){host=h;}
$('assessmentBtn')?.addEventListener('click',show);$('assessmentClose')?.addEventListener('click',()=>$('assessmentDialog')?.close());
window.pythonLabAssessment={attach,show};
})();