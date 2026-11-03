/* Recorded trace helper loaded inside the existing Pyodide worker. */
(() => {
 'use strict';
 const STEP_LIMIT=450;
 let serial=0;
 const valid=path=>typeof path==='string'&&path.split('/').every(p=>p&&p!=='.'&&p!=='..'&&/^[\w. -]+$/.test(p));
 async function run(pyodide,data,message){
  const files=data.files||{},filename=data.filename;
  if(!valid(filename)||!filename.endsWith('.py')||!Object.hasOwn(files,filename)){
   message('traceResults',{frames:[],error:'Select a Python file before tracing.',output:''});return;
  }
  const root='/tmp/python-lab-trace-'+(++serial);
  try{
   pyodide.FS.mkdirTree(root);
   for(const dir of (data.dirs||[]))if(valid(dir))pyodide.FS.mkdirTree(root+'/'+dir);
   for(const [name,code] of Object.entries(files)){
    if(!valid(name)||typeof code!=='string')continue;
    const folder=name.split('/').slice(0,-1).join('/');
    if(folder)pyodide.FS.mkdirTree(root+'/'+folder);
    pyodide.FS.writeFile(root+'/'+name,code,{encoding:'utf8'});
   }
   pyodide.globals.set('__pl_trace_root',root);
   pyodide.globals.set('__pl_trace_file',filename);
   pyodide.globals.set('__pl_trace_inputs',Array.isArray(data.inputs)?data.inputs.map(String):[]);
   pyodide.globals.set('__pl_trace_args',Array.isArray(data.args)?data.args.map(String):[]);
   pyodide.globals.set('__pl_trace_limit',STEP_LIMIT);
   const response=await fetch('python-trace-helper.py?v=1');
   if(!response.ok)throw Error('Trace helper failed to load (HTTP '+response.status+').');
   await pyodide.runPythonAsync(await response.text());
   const result=JSON.parse(pyodide.globals.get('__pl_trace_result_json'));
   message('traceResults',result);
  }catch(err){
   message('traceResults',{frames:[],error:'Unable to record trace: '+String(err),output:''});
   try{
    pyodide.globals.set('__pl_cleanup_trace_root',root);
    pyodide.runPython("import shutil\nshutil.rmtree(__pl_cleanup_trace_root, ignore_errors=True)");
   }catch{}
  }
 }
 self.pythonLabRunTrace=run;
})();
