(() => {
'use strict';
const $ = id => document.getElementById(id);
const activities = {
 gaming:{name:'Pong — Ball Movement',file:'pong_logic.py',inputs:[1,2,3],classification:'Right bounce',starter:`# Pong — Ball Movement
# Read README.md for instructions.
name = input("Player name: ").strip()
ball_x = 4
direction = 1
# TODO 1: Write a for loop that repeats 3 times.
    # TODO 2: Update ball_x using direction and 3 units.
    # TODO 3: Write if, elif, else for wall bounces.
    # Print the position and status during each frame.
print("Player:", name)
`},
 music:{name:'Playlist DJ',file:'playlist_dj.py',inputs:[5,3,5],classification:'Favorite',starter:`# Playlist DJ
# Read README.md for instructions.
name = input("DJ name: ").strip()
songs = ["Pixel Beat", "Night Drive", "Game On"]
ratings = [5, 3, 5]
favorites = 0
# TODO 1: Write a for loop that repeats 3 times.
    # TODO 2: Get the rating at the current index.
    # TODO 3: Increase favorites when rating is 5.
    # TODO 4: Write if, elif, else to set label.
    # Print the song and label during each iteration.
print("DJ:", name)
print("Favorites:", favorites)
`}
};
const state={theme:'gaming',pred:['','',''],actual:['','',''],locked:false,compared:false,reflection:'',started:false,lockedAt:''};
let host=null;
const key='python-lab-assessment-2-pong-dj';
try {Object.assign(state,JSON.parse(localStorage.getItem(key))||{});}catch{}
const save=()=>localStorage.setItem(key,JSON.stringify(state));
function element(tag,text){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;}
function button(label,fn){const b=element('button',label);b.type='button';b.onclick=fn;return b;}
function show(){render();const d=$('assessmentDialog');if(d&&!d.open)d.showModal();}
function render(){
 const root=$('assessmentContent');if(!root)return;root.replaceChildren();
 const info=activities[state.theme],totals=state.theme==='gaming'?[7,10,7]:[1,1,2];
 const choices=element('div');choices.style.cssText='display:flex;gap:12px;flex-wrap:wrap;margin:12px 0';
 for(const [id,a] of Object.entries(activities)){
  const b=button(a.name,()=>{if(state.locked)return;state.theme=id;state.pred=['','',''];state.actual=['','',''];save();render();});
  b.disabled=state.locked;b.style.cssText='padding:16px;min-width:190px;border:2px solid '+(id===state.theme?'#5b9df6':'#777')+';border-radius:12px';
  choices.append(b);
 }root.append(choices);
 const start=button('Open '+info.name+' starter',()=>{
  if(!host?.install)return alert('Python Lab is still loading.');
  const readme = state.theme==='gaming' ? [
 '# Pong — Ball Movement',
 'Create the loop yourself: write a for loop for three frames.',
 'Start at ball_x = 4, direction = 1. Each frame, update ball_x by direction * 3.',
 'Inside the loop write if/elif/else: at >= 10 set direction = -1 and status = "Right bounce"; at <= 0 set direction = 1 and status = "Left bounce"; otherwise status = "Moving".',
 'Print the ball position and status inside the loop. Predict ball_x after frames 1, 2, 3 before Debug Trace.',
 'Return to Assessment, lock predictions, use Debug Trace, enter observed values, and download the ZIP.'
 ].join('\\n\\n') : [
 '# Playlist DJ',
 'Create the loop yourself: write a for loop that processes all three songs.',
 'Use ratings [5, 3, 5]. Retrieve the rating at each index.',
 'When rating is 5, update favorites = favorites + 1.',
 'Write if/elif/else to set label: 5 = "Favorite", 4 = "Recommended", otherwise "Skip".',
 'Print the song and label inside the loop. Predict favorites after each song before Debug Trace.',
 'Return to Assessment, lock predictions, use Debug Trace, enter observed values, and download the ZIP.'
 ].join('\\n\\n');
  if(host.install({id:'assessment-2-'+state.theme,folderName:'assessment-2-'+state.theme,entryFile:info.file,files:{[info.file]:info.starter,'README.md':readme}})){state.started=true;save();$('assessmentDialog').close();}
 });root.append(start);
 root.append(element('h4',state.theme==='gaming'?'Predict ball position before debugging':'Predict favorite count before debugging'));
 const table=element('table');table.style.width='100%';const header=element('tr');['Iteration',state.theme==='gaming'?'Frame':'Song rating',state.theme==='gaming'?'Predicted ball_x':'Predicted favorites',...(state.locked?[state.theme==='gaming'?'Observed ball_x':'Observed favorites']:[])].forEach(x=>header.append(element('th',x)));table.append(header);
 for(let i=0;i<3;i++){const tr=element('tr');tr.append(element('td',String(i+1)),element('td',String(info.inputs[i])));
  const td=element('td'),input=element('input');input.type='number';input.value=state.pred[i];input.disabled=state.locked;input.setAttribute('aria-label','Predicted variable iteration '+(i+1));input.style.width='90px';input.oninput=()=>{state.pred[i]=input.value;save();};td.append(input);tr.append(td);
  if(state.locked){const observed=element('td'),actual=element('input');actual.type='number';actual.value=state.actual[i];actual.style.width='90px';actual.setAttribute('aria-label','Observed variable iteration '+(i+1));actual.oninput=()=>{state.actual[i]=actual.value;save();};observed.append(actual);tr.append(observed);}table.append(tr);
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
  const trace=['Python Assessment 2','Theme: '+info.name,'Predictions locked: '+(state.lockedAt||'Not locked'),'','Iteration | Test value | Predicted | Observed | Expected',...info.inputs.map((v,i)=>[i+1,v,state.pred[i]||'(blank)',state.actual[i]||'(blank)',totals[i]].join(' | ')),'','Reflection: '+(state.reflection||'(not completed)')].join('\\n');
  zip.file('trace_results.txt',trace);
  const blob=await zip.generateAsync({type:'blob'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='python_assessment_2_'+state.theme+'.zip';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }));
}
function attach(h){host=h;}
$('assessmentBtn')?.addEventListener('click',show);$('assessmentClose')?.addEventListener('click',()=>$('assessmentDialog')?.close());
window.pythonLabAssessment={attach,show};
})();