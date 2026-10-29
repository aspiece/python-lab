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
    const safePath=p=>typeof p==='string'&&p.split('/').every(x=>x&&!['.','..'].includes(x)&&/^[\w. -]+$/.test(x));
    const base='/home/pyodide';
    const dirs=[...(data.dirs||[]),...Object.keys(userFiles).map(n=>n.includes('/')?n.slice(0,n.lastIndexOf('/')):'')].filter(Boolean);
    for(const dir of dirs.sort((a,b)=>a.length-b.length)){
      if(!safePath(dir))continue;
      let current=base;
      for(const segment of dir.split('/')){current+='/'+segment;try{pyodide.FS.mkdir(current);}catch{}}
    }
    for(const [name,text] of Object.entries(userFiles)){
      if(!safePath(name)||typeof text!=='string')continue;
      pyodide.FS.writeFile(base+'/'+name,text,{encoding:'utf8'});
    }
    const cwd=(data.cwd&&safePath(data.cwd))?data.cwd:'';
    pyodide.FS.chdir(base+'/'+cwd);
    pyodide.globals.set('__lab_source',data.code);
    pyodide.globals.set('__lab_filename',data.filename||'main.py');
    pyodide.globals.set('__lab_stdin',inputs);
    pyodide.globals.set('__lab_args',data.args||[]);
    pyodide.globals.set('__lab_cwd',cwd);
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
class __LabNeedInput(Exception): pass
__lab_needs_input = False
def __lab_input(prompt=''):
    if prompt:
        print(prompt, end='', flush=True)
    try:
        answer = next(__lab_iterator)
    except StopIteration:
        raise __LabNeedInput()
    print(answer, flush=True)
    return answer
builtins.input=__lab_input
sys.argv=[__lab_filename]+list(__lab_args)
sys.path.insert(0, os.getcwd())
try:
    try:
        exec(compile(__lab_source, __lab_filename, 'exec'), {'__name__':'__main__','__file__':__lab_filename})
    except __LabNeedInput:
        __lab_needs_input = True
finally:
    builtins.input=__lab_original_input
    sys.argv=__lab_old_argv
    if sys.path and sys.path[0] == os.getcwd(): sys.path.pop(0)`;
    try {
      await pyodide.runPythonAsync(script);
      if(pyodide.globals.get('__lab_needs_input')) message('needInput');
      else message('done',{success:true});
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