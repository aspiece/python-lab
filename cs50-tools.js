/* CS50P submission handoff for browser-only Python Lab.
 * Never sends student files, passwords or tokens to CS50/GitHub.
 * The user must complete any official submit50 command in CS50 Codespaces.
 */
(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const library=()=>window.pythonLabCS50P;
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
 function getProblem(){
  const id=$('cs50AssignmentSelect')?.value;
  return library()?.get(id)||null;
 }
 function chooseProblem(){
  const workspace=callbacks.workspace?.()||{},path=String(workspace.filename||'');
  const names=path.split('/'),base=names[names.length-1]||'';
  const folder=names.length>1?names[0].replace(/-\d+$/,''):'';
  const all=entries();
  const folderHit=all.find(item=>item.slug===folder&&item.filename===base);
  if(folderHit)return folderHit.id;
  const name=callbacks.projectName?.();
  const titleHit=all.find(item=>item.slug===name&&item.filename===base);
  if(titleHit)return titleHit.id;
  return all.find(item=>item.filename===base)?.id||all[0]?.id||'';
 }
 function submissionFiles(problem){
  const workspace=callbacks.workspace?.()||{};
  const files=workspace.files||{},names=Object.keys(files);
  const sameProblemFolder=folder=>folder===problem.slug||new RegExp('^'+problem.slug+'-\\d+$').test(folder);
  const activeFolder=String(workspace.filename||'').split('/').length>1?
    String(workspace.filename).split('/')[0]:'';
  const cwdFolder=String(workspace.cwd||'').split('/')[0];
  const preferredFolder=[activeFolder,cwdFolder].find(folder=>sameProblemFolder(folder));
  const prefix=preferredFolder||names.find(name=>sameProblemFolder(name.split('/')[0]))?.split('/')[0]||'';
  const selected={};
  if(prefix){
   for(const [path,value] of Object.entries(files)){
    const name=path.slice(prefix.length+1);
    if(path.startsWith(prefix+'/')&&name.endsWith('.py')&&typeof value==='string')selected[name]=value;
   }
  }else{
   const known=new Set(Object.keys(problem.files).filter(file=>file.endsWith('.py')));
   for(const [path,value] of Object.entries(files)){
    if(!path.includes('/')&&known.has(path)&&typeof value==='string')selected[path]=value;
   }
  }
  return selected;
 }
 function render(){
  const problem=getProblem();if(!problem)return;
  const cmd=commands(problem);
  $('cs50ProblemTitle').textContent='Problem Set '+problem.set+' · '+problem.title;
  $('cs50InstructionsLink').href=problem.url;
  $('cs50CheckCommand').textContent=cmd.check;
  $('cs50SubmitCommand').textContent=cmd.submit;
  const selected=submissionFiles(problem);
  const names=Object.keys(selected).sort();
  const fileCount=names.length;
  const extras=Array.isArray(problem.extraFiles)?problem.extraFiles:[];
  $('cs50ExtraFilesList').textContent=extras.length?
    extras.map(item=>item.name+' — '+item.kind+' (get it from the full CS50 page)').join('\n')+
    '\n\nKeep these files in the problem folder for testing. Only submit them if CS50 asks.':
    'No extra CS50 sample files listed for this problem. If your code reads another file, bring it too.';
  $('cs50FilesList').textContent=names.length?
   names.map(name=>problem.slug+'/'+name).join('\n'):
   'No matching files found. Select a starter or open the assignment files first.';

  $('cs50PackageStatus').textContent=names.length?
   'Download '+(fileCount===1?'this Python file':'these '+fileCount+' Python files')+' from Explorer. Check the extra files above. Do not send README.md.':
   'No Python files found for this problem. Open your code in Explorer first.';
 }
 function show(){
  const select=$('cs50AssignmentSelect');if(!select)return;
  const choices=entries();select.textContent='';
  for(const item of choices){
   const option=document.createElement('option');option.value=item.id;
   option.textContent='Set '+item.set+' — '+item.title+' ('+item.filename+')';
   select.append(option);
  }
  select.value=chooseProblem();
  render();
  const dialog=$('cs50SubmissionDialog');
  if(dialog?.showModal&&!dialog.open)dialog.showModal();
 }
 async function copy(text){
  try{
   if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);return;}
  }catch{}
  prompt('Copy this command into the official CS50 Codespace terminal:',text);
 }
 function attach(config){callbacks=config||{};}
 $('cs50ToolsBtn')?.addEventListener('click',show);
 $('cs50FromTemplatesBtn')?.addEventListener('click',()=>{$('templatesDialog')?.close?.();show();});
 $('cs50CloseBtn')?.addEventListener('click',()=> $('cs50SubmissionDialog')?.close?.());
 $('cs50AssignmentSelect')?.addEventListener('change',render);
 $('cs50CopyCheck')?.addEventListener('click',()=>{const problem=getProblem();if(problem)copy(commands(problem).check);});
 $('cs50CopySubmit')?.addEventListener('click',()=>{const problem=getProblem();if(problem)copy(commands(problem).submit);});
 function packageResult(result){
  const element=$('cs50LibraryStatus');
  if(!element)return;
  element.textContent=result.success?
   'CS50 Python library loaded automatically and is ready to import.':
   'CS50 Python library unavailable in this browser: '+String(result.error||'Unsupported dependency').slice(0,230)+'. Regular Python remains available.';
 }
 window.pythonLabCS50Tools={show,attach,packageResult,submissionFiles,submissionSlug,commands};
})();
