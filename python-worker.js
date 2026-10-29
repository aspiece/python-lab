/* Python Lab worker: isolated Python runtime, visible errors, package discovery. */
const PYODIDE_BASE = 'https://cdn.jsdelivr.net/pyodide/v0.28.3/full/';
let pyodide, initialized=false, initializing;
function message(type, extra={}) { self.postMessage({type,...extra}); }
async function init() {
  if(initialized)return;
  if(initializing)return initializing;
  initializing=(async()=>{
    try {
      importScripts(PYODIDE_BASE+'pyodide.js');
      if(typeof loadPyodide!=='function')throw Error('Pyodide loader was unavailable');
      pyodide=await loadPyodide({indexURL:PYODIDE_BASE});
      pyodide.setStdout({batched:s=>message('output',{text:s+'\n'})});
      pyodide.setStderr({batched:s=>message('output',{text:s+'\n',stream:'stderr'})});
      initialized=true;
      message('ready');
    } catch(err) {
      initializing=null;
      throw err;
    }
  })();
  return initializing;
}
self.onmessage=async ({data})=>{
  try {
    if(data.type==='init'){await init();return;}
    if(data.type!=='run')return;
    await init();
    let inputs=data.stdin?data.stdin.replace(/\r\n/g,'\n').split('\n'):[];
    const userFiles=data.files||{};
    for(const [name,text] of Object.entries(userFiles)){
      if(!/^[\w.\-]+$/.test(name))continue;
      pyodide.FS.writeFile('/home/pyodide/'+name,text,{encoding:'utf8'});
    }
    pyodide.FS.chdir('/home/pyodide');
    pyodide.globals.set('__lab_source',data.code);
    pyodide.globals.set('__lab_filename',data.filename||'main.py');
    pyodide.globals.set('__lab_stdin',inputs);
    pyodide.globals.set('__lab_args',data.args||[]);
    await pyodide.loadPackagesFromImports(data.code);
    const names=[...data.code.matchAll(/^\s*(?:from|import)\s+(emoji|pyfiglet|inflect|requests|validators|tabulate|pytest|PIL|cowsay)(?:\b|\.)/gm)].map(m=>m[1]);
    if(names.length){
      await pyodide.loadPackage('micropip');
      const mp=pyodide.pyimport('micropip');
      for(const name of [...new Set(names)]){
        const pkg=name==='PIL'?'pillow':name;
        message('output',{text:'Checking package: '+pkg+'\n'});
        try{await mp.install(pkg);}catch(err){message('output',{text:'Package install failed ('+pkg+'): '+String(err)+'\n',stream:'stderr'});}
      }
      mp.destroy?.();
    }

    const script=`import sys, builtins, os
from io import StringIO
__lab_original_input = builtins.input
__lab_old_argv = sys.argv[:]
__lab_old_cwd = os.getcwd()
__lab_iterator = iter(__lab_stdin)
def __lab_input(prompt=''):
    if prompt:
        print(prompt, end='', flush=True)
    try:
        answer = next(__lab_iterator)
    except StopIteration:
        raise EOFError('No input remaining. Add answers in Program Input, one per line.')
    print(answer, flush=True)
    return answer
builtins.input=__lab_input
sys.argv=[__lab_filename]+list(__lab_args)
try:
    exec(compile(__lab_source, __lab_filename, 'exec'), {'__name__':'__main__','__file__':__lab_filename})
finally:
    builtins.input=__lab_original_input
    sys.argv=__lab_old_argv`;
    try {
      await pyodide.runPythonAsync(script);
      message('done',{success:true});
    } catch(err) {
      message('output',{text:String(err)+'\n',stream:'stderr'});
      message('done',{success:false});
    } finally {
      const changed={};
      for(const name of Object.keys(userFiles)){
        try{changed[name]=pyodide.FS.readFile('/home/pyodide/'+name,{encoding:'utf8'});}catch{}
      }
      message('files',{files:changed});
    }
  }catch(err){message('fatal',{message:String(err)+(err&&err.stack?'\n'+err.stack:'')});}
};