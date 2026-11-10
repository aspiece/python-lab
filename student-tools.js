/* Classroom help: safe project export, quick Python reference, and basic network diagnostics. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const reference=[
  ['print and input','Show text and ask questions','name = input("Name: ")\nprint("Hello", name)'],
  ['Variables and numbers','Store values and calculate','score = 10\nscore += 5\nprint(score)'],
  ['If / elif / else','Choose which code runs','if score >= 10:\n    print("Ready")\nelse:\n    print("Keep trying")'],
  ['For loops / range','Repeat code a set number of times','for number in range(1, 4):\n    print(number)'],
  ['While loops','Repeat while a condition is true','count = 3\nwhile count > 0:\n    print(count)\n    count -= 1'],
  ['Strings: strip, lower, upper','Clean and change text','word = "  Hello  "\nprint(word.strip().lower())'],
  ['Strings: split and replace','Break text apart or replace a piece','words = "red,blue".split(",")\nprint("cat".replace("c", "b"))'],
  ['Strings: slicing','Select part of a string','word = "Python"\nprint(word[1:4])  # yth'],
  ['Lists: append, len','Store several items and add more','items = ["pen", "book"]\nitems.append("ruler")\nprint(len(items))'],
  ['Dictionaries: keys and get','Look up a value using a key','points = {"Alex": 5}\nprint(points.get("Sam", 0))'],
  ['Functions and return','Reuse instructions with inputs','def double(number):\n    return number * 2\nprint(double(4))'],
  ['Try / except','Handle an error you expect','try:\n    age = int(input("Age: "))\nexcept ValueError:\n    print("Enter a number")'],
  ['Testing with pytest','Check what your function returns','def add(a, b):\n    return a + b\n\ndef test_add():\n    assert add(2, 3) == 5']
 ];
 const panels={reference:$('toolsReferencePanel'),backup:$('toolsBackupPanel'),network:$('toolsNetworkPanel')};
 function select(name){
  for(const [id,panel] of Object.entries(panels)){if(panel)panel.hidden=id!==name;const btn=$('tools'+id[0].toUpperCase()+id.slice(1)+'Tab');if(btn)btn.setAttribute('aria-pressed',String(id===name));}
  if(name==='backup'){const info=$('backupStorageInfo');const mode=window.pythonLabProjects?.state?.().mode||'unknown';if(info)info.textContent=mode==='indexeddb'?'Saved on this device using IndexedDB. Still download a backup before changing devices.':mode==='localStorage'?'Limited browser storage. Download a backup regularly.':'Local storage may be temporary or unavailable. Download a backup now.';}
 }
 function renderReference(){
  const host=$('pythonReferenceResults');if(!host)return;host.textContent='';
  const q=($('pythonReferenceSearch')?.value||'').toLowerCase().trim();
  const found=reference.filter(item=>item.some(v=>v.toLowerCase().includes(q)));
  for(const [title,description,example] of found){
   const row=document.createElement('article');row.className='python-reference-entry';
   const h=document.createElement('h4');h.textContent=title;
   const p=document.createElement('p');p.textContent=description;
   const pre=document.createElement('pre');pre.textContent=example;
   row.append(h,p,pre);host.append(row);
  }
  if(!found.length){const p=document.createElement('p');p.textContent='No matching topic. Try another keyword.';host.append(p);}
 }
 async function backup(){
  const status=$('backupStatus'),button=$('downloadBackupBtn');if(!status)return;
  if(typeof JSZip==='undefined'){status.textContent='ZIP tools did not load. Ask school IT to check jsDelivr access.';return;}
  const workspace=window.pythonLabWorkspace?.();
  if(!workspace?.files){status.textContent='No project files are available.';return;}
  button.disabled=true;status.textContent='Preparing your project backup…';
  try{
   const zip=new JSZip();
   for(const dir of workspace.dirs||[])if(dir)zip.folder(dir);
   for(const [path,contents] of Object.entries(workspace.files))zip.file(path,String(contents));
   const blob=await zip.generateAsync({type:'blob',compression:'DEFLATE'});
   const url=URL.createObjectURL(blob),a=document.createElement('a');
   a.href=url;
   const name=($('currentProjectName')?.textContent||'python-project').replace(/[^a-z0-9_-]+/gi,'-').replace(/^-|-$/g,'')||'python-project';
   a.download=name+'-backup.zip';document.body.append(a);a.click();a.remove();
   setTimeout(()=>URL.revokeObjectURL(url),1500);
   status.textContent='Backup downloaded. Store this ZIP somewhere safe. Import ZIP can restore its files.';
  }catch(error){status.textContent='Could not create backup: '+String(error.message||error);}
  finally{button.disabled=false;}
 }
 async function checkNetwork(){
  const host=$('networkCheckResults');if(!host)return;host.textContent='Checking required assets…';
  const assets=[
   ['Python worker','python-worker.js?v=19'],
   ['Monaco editor','https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs/loader.js'],
   ['ZIP export library','https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js']
  ];
  const results=await Promise.all(assets.map(async ([name,url])=>{
   try{const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),8000);
    try{const response=await fetch(url,{method:'GET',cache:'no-store',signal:controller.signal});return [name,response.ok?'Reachable':'HTTP '+response.status];}
    finally{clearTimeout(timeout);}
   }catch(error){return [name,'Unavailable or blocked: '+String(error.message||error)];}
  }));
  host.textContent='';
  for(const [name,result] of results){const row=document.createElement('div');row.className='network-check-result';row.textContent=name+': '+result;host.append(row);}
  const note=document.createElement('p');note.textContent='A reachable file does not guarantee the whole Python runtime works. If Run still fails, ask school IT to inspect blocked jsDelivr/Pyodide requests.';host.append(note);
 }
 function show(){renderReference();select('reference');$('studentToolsDialog')?.showModal?.();}
 $('studentToolsBtn')?.addEventListener('click',show);
 $('studentToolsClose')?.addEventListener('click',()=>$('studentToolsDialog')?.close?.());
 for(const id of Object.keys(panels))$('tools'+id[0].toUpperCase()+id.slice(1)+'Tab')?.addEventListener('click',()=>select(id));
 $('pythonReferenceSearch')?.addEventListener('input',renderReference);
 $('downloadBackupBtn')?.addEventListener('click',backup);
 $('networkCheckBtn')?.addEventListener('click',checkNetwork);
 window.pythonLabStudentTools={show,backup,checkNetwork};
})();