/* Python Lab worker: isolated Python runtime, visible errors, package discovery. */
const PYODIDE_BASE = 'https://cdn.jsdelivr.net/pyodide/v0.28.3/full/';
let pyodide, initialized=false, initializing;
let lastWorkspaceFiles=new Set(),lastWorkspaceDirs=new Set();
function message(type, extra={}) { self.postMessage({type,...extra}); }
async function init() {
  if(initialized)return;
  if(initializing)return initializing;
  initializing=(async()=>{
    try {
      importScripts(PYODIDE_BASE+'pyodide.js');
      if(typeof loadPyodide!=='function')throw Error('Pyodide loader was unavailable');
      pyodide=await loadPyodide({indexURL:PYODIDE_BASE});
      pyodide.setStdout({batched:s=>message('output',{text:s})});
      pyodide.setStderr({batched:s=>message('output',{text:s,stream:'stderr'})});
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
    if(data.type==='diagnose'){
      await init();
      try{
        pyodide.globals.set('__lab_diag_json',JSON.stringify(data.files||{}));
        const response=pyodide.runPython("import ast, json\n__lab_problems = []\nfor __lab_path, __lab_code in json.loads(__lab_diag_json).items():\n    try:\n        ast.parse(__lab_code, filename=__lab_path)\n    except SyntaxError as exc:\n        __lab_problems.append({'file': __lab_path, 'line': max(1, exc.lineno or 1), 'column': max(1, exc.offset or 1), 'endLine': max(1, exc.end_lineno or exc.lineno or 1), 'endColumn': max(2, exc.end_offset or (exc.offset or 1) + 1), 'message': exc.msg})\njson.dumps(__lab_problems)");
        message('diagnostics',{id:data.id,problems:JSON.parse(response)});
      }catch(err){
        message('diagnostics',{id:data.id,problems:[],error:'Unable to check syntax: '+String(err)});
      }
      return;
    }
    if(data.type!=='run')return;
    await init();
    let inputs=data.stdin?data.stdin.replace(/\r\n/g,'\n').split('\n'):[];
    const userFiles=data.files||{};
    const safePath=p=>typeof p==='string'&&p.split('/').every(x=>x&&!['.','..'].includes(x)&&/^[\w. -]+$/.test(x));
    const base='/home/pyodide';
    // A previous run may have changed cwd into a folder the student deleted.
    // Return to the workspace root before removing stale files and folders.
    try{pyodide.FS.chdir(base);}catch{}
    // On each input replay, restore the previous workspace snapshot before
    // executing the script. This avoids duplicate file appends and repeated
    // local writes, but cannot undo external network effects or randomness.
    // Keep the virtual filesystem consistent with Explorer renames and deletions.
    for(const old of lastWorkspaceFiles){
      if(!Object.hasOwn(userFiles,old))try{pyodide.FS.unlink(base+'/'+old);}catch{}
    }
    lastWorkspaceFiles=new Set(Object.keys(userFiles));
    const dirs=[...(data.dirs||[]),...Object.keys(userFiles).map(n=>n.includes('/')?n.slice(0,n.lastIndexOf('/')):'')].filter(Boolean);
    const expectedDirs=new Set();
    for(const dir of dirs)if(safePath(dir)){let p='';for(const seg of dir.split('/')){p=p?p+'/'+seg:seg;expectedDirs.add(p);}}
    // A deleted Explorer folder must not reappear merely because Pyodide retained it.
    for(const dir of [...lastWorkspaceDirs].sort((a,b)=>b.length-a.length)){
      if(expectedDirs.has(dir))continue;
      try{pyodide.FS.rmdir(base+'/'+dir);}catch{}
    }
    lastWorkspaceDirs=new Set(expectedDirs);
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
      if(data.purpose==='tests'){
        await pyodide.loadPackage('pytest');
        const pytestScript = "import json, pytest\n"+
        "class __LabPytestCapture:\n"+
        "    def __init__(self): self.tests=[]\n"+
        "    def pytest_runtest_logreport(self, report):\n"+
        "        if report.when == 'call' or (report.when == 'setup' and (report.failed or report.skipped)) or (report.when == 'teardown' and report.failed):\n"+
        "            location = getattr(report, 'location', ('',0,''))\n"+
        "            filename = str(location[0]).replace('/home/pyodide/', '')\n"+
        "            outcome = 'error' if report.failed and report.when != 'call' else str(report.outcome)\n"+
        "            self.tests.append({'name': str(report.nodeid), 'file': filename, 'line': int(location[1])+1, 'outcome': outcome, 'details': str(getattr(report, 'longreprtext', ''))[:2000] if outcome in ('failed', 'error') else ''})\n"+
        "    def pytest_collectreport(self, report):\n"+
        "        if report.failed:\n"+
        "            location = str(report.nodeid).split('::')[0].replace('/home/pyodide/', '')\n"+
        "            self.tests.append({'name': str(report.nodeid), 'file': location, 'line': 1, 'outcome': 'error', 'details': str(getattr(report, 'longrepr', ''))[:2000]})\n"+
        "__lab_pytest_capture = __LabPytestCapture()\n"+
        "__lab_test_exit = int(pytest.main(['/home/pyodide','-q','--tb=short'], plugins=[__lab_pytest_capture]))\n"+
        "__lab_tests_json = json.dumps({'tests': __lab_pytest_capture.tests, 'exitCode': __lab_test_exit})\n";
        await pyodide.runPythonAsync(pytestScript);
        const results=JSON.parse(pyodide.globals.get('__lab_tests_json'));
        message('testResults',results);
        message('done',{success:results.exitCode===0});
      }else{
        await pyodide.runPythonAsync(script);
        if(pyodide.globals.get('__lab_needs_input')) message('needInput');
        else message('done',{success:true});
      }
    } catch(err) {
      message('output',{text:String(err)+'\n',stream:'stderr'});
      if(data.purpose==='tests')message('testResults',{tests:[],exitCode:2,error:String(err)});
      message('done',{success:false});
    } finally {
      // Discover text files and folders created by Python, including nested project folders.
      const changed={},newDirs=[];let count=0;
      function collect(directory,relative,depth){
        if(depth>9||count>200)return;
        for(const name of pyodide.FS.readdir(directory)){
          if(name==='.'||name==='..'||name==='__pycache__'||name.startsWith('.'))continue;
          const path=relative?relative+'/'+name:name;
          if(!safePath(path))continue;
          const absolute=directory+'/'+name;
          let stat;try{stat=pyodide.FS.stat(absolute);}catch{continue;}
          if(pyodide.FS.isDir(stat.mode)){newDirs.push(path);collect(absolute,path,depth+1);}
          else if(pyodide.FS.isFile(stat.mode)&&stat.size<=1024*1024&&/\.(py|txt|csv|json|md|html|css|js|toml|ini)$/i.test(path)){
            count++;try{const value=pyodide.FS.readFile(absolute,{encoding:'utf8'});if(!value.includes('\0'))changed[path]=value;}catch{}
          }
        }
      }
      try{collect(base,'',0);}catch(err){message('output',{text:'Workspace synchronization: '+String(err)+'\n',stream:'stderr'});}
      lastWorkspaceFiles=new Set(Object.keys(changed));
      lastWorkspaceDirs=new Set(newDirs);
      message('files',{files:changed,dirs:newDirs});
    }
  }catch(err){message('fatal',{message:String(err)+(err&&err.stack?'\n'+err.stack:'')});}
};