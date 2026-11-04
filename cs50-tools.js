/* Student-controlled CS50 Codespaces handoff for browser-only Python Lab.
 * No student files, account details, or credentials are sent to CS50 here.
 * Only CS50 Codespaces can run an authenticated check50/submit50 command.
 */
(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const library=()=>window.pythonLabCS50P;
 const progressMemory=new Map();
 let callbacks={};

 const submissionSlug=problem=>{
  if(!problem||!Number.isInteger(problem.set)||!/^[-_a-z0-9]+$/.test(problem.slug))return '';
  const suffix=problem.set===5?'tests/'+problem.slug.replace(/^test_/,''):problem.slug;
  return 'cs50/problems/2022/python/'+suffix;
 };
 const commands=problem=>{
  const slug=submissionSlug(problem);
  return {check:'check50 '+slug,submit:'submit50 '+slug};
 };
 const entries=()=>library()?.catalog()||[];
 const getProblem=()=>library()?.get($('cs50AssignmentSelect')?.value)||null;
 const sameFolder=(problem,folder)=>folder===problem.slug||new RegExp('^'+problem.slug+'-\\d+$').test(folder);
 const basename=path=>String(path).split('/').pop();

 function chooseProblem(){
  const workspace=callbacks.workspace?.()||{},path=String(workspace.filename||'');
  const parts=path.split('/'),base=basename(path),folder=parts.length>1?parts[0].replace(/-\d+$/,''):'';
  const all=entries();
  const folderHit=all.find(item=>item.slug===folder&&(item.filename===base||
   item.files.includes(base)));
  if(folderHit)return folderHit.id;
  const projectName=callbacks.projectName?.();
  const titleHit=all.find(item=>item.slug===projectName&&item.files.includes(base));
  if(titleHit)return titleHit.id;
  return all.find(item=>item.filename===base)?.id||all[0]?.id||'';
 }

 // Choose the open copy of an assignment (indoor, indoor-2, etc.).
 // Keep file paths with their original folder so Download cannot pick the wrong copy.
 function selection(problem){
  const workspace=callbacks.workspace?.()||{},files=workspace.files||{};
  const names=Object.keys(files);
  const opened=String(workspace.filename||'').split('/');
  const activeFolder=opened.length>1?opened[0]:'';
  const cwdFolder=String(workspace.cwd||'').split('/')[0];
  const folder=[activeFolder,cwdFolder].find(value=>sameFolder(problem,value))||
   names.find(name=>sameFolder(problem,name.split('/')[0]))?.split('/')[0]||'';
  const expected=new Set(Object.keys(problem.files).filter(name=>name.endsWith('.py')));
  const knownExtras=new Set((problem.extraFiles||[]).map(item=>item.name));
  const standalone=String(callbacks.projectName?.()||'')===problem.slug;
  const result={};
  for(const [path,value] of Object.entries(files)){
   if(typeof value!=='string')continue;
   let relative='';
   if(folder){
    if(!path.startsWith(folder+'/'))continue;
    relative=path.slice(folder.length+1);
   }else{
    if(path.includes('/'))continue;
    relative=path;
    if(!standalone&&!expected.has(relative)&&!knownExtras.has(relative))continue;
   }
   if(!relative||relative.split('/').some(segment=>segment==='..'))continue;
   if(basename(relative).toLowerCase()==='readme.md')continue;
   // The editor stores text project files. Image and ZIP assets come from CS50.
   if(!/\.(py|txt|csv|json|toml|ini|html|css|js)$/i.test(relative))continue;
   result[relative]={path,content:value};
  }
  const readmePath=folder?folder+'/README.md':'README.md';
  return {folder:folder||problem.slug,files:result,
   readmePath:Object.hasOwn(files,readmePath)?readmePath:null};
 }
 function submissionFiles(problem){
  const chosen=selection(problem).files,files={};
  for(const [name,item] of Object.entries(chosen)){
   if(name.endsWith('.py'))files[name]=item.content;
  }
  return files;
 }
 function transferFiles(problem){return selection(problem).files;}

 function progressKey(problem){
  const project=String(callbacks.projectId?.()||callbacks.projectName?.()||'local');
  const folder=selection(problem).folder;
  return 'python-lab-cs50-handoff-v1/'+encodeURIComponent(project)+
   '/'+encodeURIComponent(folder)+'/'+problem.id;
 }
 const emptyProgress=()=>({files:false,checked:false,submitted:false});
 function readProgress(key){
  if(progressMemory.has(key))return {...progressMemory.get(key)};
  let progress=emptyProgress();
  try{
   const value=JSON.parse(localStorage.getItem(key)||'null');
   if(value&&typeof value==='object'){
    progress={files:value.files===true,checked:value.checked===true,submitted:value.submitted===true};
   }
  }catch{}
  progressMemory.set(key,progress);
  return {...progress};
 }
 function saveProgress(key,progress){
  progressMemory.set(key,{...progress});
  try{localStorage.setItem(key,JSON.stringify(progress));}catch{}
 }
 function renderProgress(problem){
  const progress=readProgress(progressKey(problem));
  for(const [name,id] of [['files','cs50StepFiles'],['checked','cs50StepChecked'],['submitted','cs50StepSubmitted']]){
   $(id).checked=progress[name];
  }
  const total=Object.values(progress).filter(Boolean).length;
  const status=$('cs50ChecklistStatus');
  status.textContent=total===3?
   'You marked all three steps. Check CS50 for the real submission status.':
   total+' of 3 steps marked. Your boxes are saved on this device.';
  status.classList?.toggle('cs50-checklist-complete',total===3);
 }

 function status(message){$('cs50PackageStatus').textContent=message;}
 async function copy(text,label){
  try{
   if(typeof navigator!=='undefined'&&navigator.clipboard?.writeText){
    await navigator.clipboard.writeText(text);
    status('Copied '+label+'. Paste it into the correct file or terminal in Codespaces.');
    return true;
   }
  }catch{}
  if(typeof prompt==='function'){
   prompt('Copy '+label+' and paste it into Codespaces:',text);
   status('Copy the text from the box into Codespaces. It was not pasted for you.');
   return false;
  }
  status('Clipboard access is blocked. Download the file instead.');
  return false;
 }
 function addButton(parent,label,handler){
  const button=document.createElement('button');
  button.type='button';button.textContent=label;
  button.addEventListener('click',handler);
  parent.append(button);
  return button;
 }
 function renderTransferRows(problem,chosen){
  const host=$('cs50TransferFiles');host.textContent='';
  const items=Object.entries(chosen).sort(([a],[b])=>a.localeCompare(b));
  if(!items.length){
   const p=document.createElement('p');
   p.textContent='No files found for this assignment. Open or create a starter first.';
   host.append(p);return;
  }
  for(const [relative,entry] of items){
   const row=document.createElement('div');row.className='cs50-transfer-file';
   const name=document.createElement('span');name.className='cs50-transfer-file-name';
   name.textContent=relative;
   const actions=document.createElement('div');actions.className='cs50-transfer-file-actions';
   addButton(actions,'Download',()=>{
    try{
     if(typeof callbacks.downloadFile!=='function'){
      status('Download is not ready. Right-click this file in Explorer instead.');return;
     }
     callbacks.downloadFile(entry.path);
     status('Saved '+basename(relative)+' to your device. Now upload it to Codespaces.');
    }catch(error){status('Could not download '+relative+': '+String(error.message||error));}
   });
   addButton(actions,relative.endsWith('.py')?'Copy code':'Copy text',()=>{
    // Read the latest editor content when the button is pressed.
    const fresh=selection(problem).files[relative];
    if(!fresh){status('This file is no longer in the project. Open your assignment again.');return;}
    void copy(fresh.content,basename(relative));
   });
   row.append(name,actions);host.append(row);
  }
 }
 function renderAssets(problem){
  const extras=Array.isArray(problem.extraFiles)?problem.extraFiles:[];
  $('cs50ExtraFilesList').textContent=extras.length?
   extras.map(item=>item.name+' — '+item.kind).join('\n')+
   '\n\nGet these from the CS50 problem page. Only submit them if CS50 asks.':
   'No CS50 sample files listed. If your code reads another file, bring it too.';
  const links=$('cs50AssetLinks');links.textContent='';
  for(const item of extras){
   if(!item.url?.startsWith('https://cs50.harvard.edu/'))continue;
   const a=document.createElement('a');
   a.href=item.url;a.textContent='Get '+item.name;
   a.target='_blank';a.rel='noopener noreferrer';
   links.append(a);
  }
 }
 function render(){
  const problem=getProblem();if(!problem)return;
  const cmd=commands(problem),chosen=transferFiles(problem);
  const names=Object.keys(chosen).filter(name=>name.endsWith('.py')).sort();
  $('cs50ProblemTitle').textContent='Problem Set '+problem.set+' · '+problem.title;
  $('cs50FolderName').textContent=problem.slug;
  $('cs50InstructionsLink').href=problem.url;
  $('cs50CheckCommand').textContent=cmd.check;
  $('cs50SubmitCommand').textContent=cmd.submit;
  $('cs50FilesList').textContent=names.length?
   names.map(name=>problem.slug+'/'+name).join('\n'):
   'No matching Python files found. Select a starter or open its code first.';
  const readme=selection(problem).readmePath;
  $('cs50ReadmeBtn').disabled=!readme||typeof callbacks.openFile!=='function';
  renderTransferRows(problem,chosen);
  renderAssets(problem);
  status(names.length?
   'Move your Python files and any other files your code needs. Do not send README.md.':
   'No Python files found for this problem. Open your code in Explorer first.');
  renderProgress(problem);
 }
 function show(){
  const select=$('cs50AssignmentSelect');if(!select)return;
  select.textContent='';
  for(const item of entries()){
   const option=document.createElement('option');
   option.value=item.id;option.textContent='Set '+item.set+' — '+item.title;
   select.append(option);
  }
  select.value=chooseProblem();
  render();
  const dialog=$('cs50SubmissionDialog');
  if(dialog?.showModal&&!dialog.open)dialog.showModal();
 }

 function attach(config){callbacks=config||{};}
 $('cs50ToolsBtn')?.addEventListener('click',show);
 $('cs50FromTemplatesBtn')?.addEventListener('click',()=>{
  $('templatesDialog')?.close?.();show();
 });
 $('cs50CloseBtn')?.addEventListener('click',()=> $('cs50SubmissionDialog')?.close?.());
 $('cs50AssignmentSelect')?.addEventListener('change',render);
 $('cs50ReadmeBtn')?.addEventListener('click',()=>{
  const problem=getProblem(),path=problem&&selection(problem).readmePath;
  if(!path||typeof callbacks.openFile!=='function')return;
  callbacks.openFile(path);
  $('cs50SubmissionDialog')?.close?.();
 });
 $('cs50CopyCheck')?.addEventListener('click',()=>{
  const problem=getProblem();if(problem)void copy(commands(problem).check,'check50 command');
 });
 $('cs50CopySubmit')?.addEventListener('click',()=>{
  const problem=getProblem();if(problem)void copy(commands(problem).submit,'submit50 command');
 });
 for(const [name,id] of [['files','cs50StepFiles'],['checked','cs50StepChecked'],['submitted','cs50StepSubmitted']]){
  $(id)?.addEventListener('change',()=>{
   const problem=getProblem();if(!problem)return;
   const key=progressKey(problem),progress=readProgress(key);
   progress[name]=$(id).checked===true;
   saveProgress(key,progress);renderProgress(problem);
  });
 }
 function packageResult(result){
  const element=$('cs50LibraryStatus');if(!element)return;
  element.textContent=result.success?
   'CS50 Python library loaded automatically and is ready to import.':
   'CS50 Python library unavailable in this browser: '+
   String(result.error||'Unsupported dependency').slice(0,230)+'. Regular Python remains available.';
 }
 window.pythonLabCS50Tools={show,attach,packageResult,submissionFiles,transferFiles,selection,
  submissionSlug,commands,progressKey,readProgress};
})();
