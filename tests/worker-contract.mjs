import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {spawnSync} from 'node:child_process';

const code=readFileSync(new URL('../python-worker.js',import.meta.url),'utf8');
const sent=[],globals=new Map(),pythonScripts=[],installCalls=[];
const pyodide={
 setStdout(){},setStderr(){},
 globals:{set:(key,value)=>globals.set(key,value),get:key=>globals.get(key)},
 loadPackagesFromImports:async()=>{},
 loadPackage:async name=>{assert(['pytest','micropip'].includes(name));},
 pyimport:name=>{assert.equal(name,'micropip');return {install:async pkg=>{installCalls.push(pkg);assert.equal(pkg,'cs50==9.5.0');},destroy(){}};},
 runPython(source){pythonScripts.push(source);return JSON.stringify([{file:'main.py',line:2,column:5,message:'invalid syntax'}]);},
 async runPythonAsync(source){
  pythonScripts.push(source);
  if(source.includes('__LabPytestCapture')){
   globals.set('__lab_tests_json',JSON.stringify({exitCode:1,tests:[
    {name:'test_main.py::test_example',file:'test_main.py',line:2,outcome:'failed',details:'assert False'}
   ]}));
  }
 },
 FS:{
  chdir(){},unlink(){},rmdir(){},mkdir(){},writeFile(){},
  readdir:()=>['.','..'],
  stat:()=>({mode:1,size:0}),
  isDir:()=>false,isFile:()=>false,readFile:()=>''
 }
};
const self={postMessage:message=>sent.push(message)};
runInNewContext(code,{self,importScripts(){},loadPyodide:async()=>pyodide});
await self.onmessage({data:{type:'init'}});
assert(sent.some(m=>m.type==='ready'),'Worker not ready');
assert.deepEqual(installCalls,['cs50==9.5.0'],'The official CS50 package was not installed automatically');
assert(sent.some(m=>m.type==='packageStatus'&&m.name==='cs50'&&m.success===true&&m.automatic===true),'CS50 automatic preload status missing');
assert(sent.findIndex(m=>m.type==='packageStatus'&&m.name==='cs50')<sent.findIndex(m=>m.type==='ready'),'The worker reported Python ready before installing CS50');
assert(pythonScripts.includes('import cs50'),'CS50 import was not verified');
await self.onmessage({data:{type:'diagnose',id:7,files:{'main.py':'if True\n  pass'}}});
const diagnostic=sent.find(m=>m.type==='diagnostics');
assert(diagnostic,'Worker did not send syntax diagnostics');
assert.equal(diagnostic.id,7);
assert.equal(diagnostic.problems[0].line,2);
const astSource=pythonScripts.find(source=>source.includes('ast.parse'));
assert(astSource,'No Python AST parser code was created');

await self.onmessage({data:{
 type:'run',purpose:'tests',filename:'__command__.py',code:'',cwd:'',args:[],stdin:'',
 files:{'main.py':'print(2)','test_main.py':'def test_example():\n    assert False'},dirs:[]
}});
const result=sent.find(m=>m.type==='testResults');
assert(result,'Worker did not send individual pytest results');
assert.equal(result.exitCode,1);
assert.equal(result.tests[0].outcome,'failed');
assert(sent.some(m=>m.type==='done'&&m.success===false),'Failed tests marked as success');
assert(sent.some(m=>m.type==='files'),'Workspace synchronization was skipped');
const pytestSource=pythonScripts.find(source=>source.includes('__LabPytestCapture'));
assert(pytestSource,'No structured pytest runner was created');
for(const [label,source] of [['Python diagnostic helper',astSource],['Python pytest runner',pytestSource]]){
 const output=spawnSync('python3',['-c','import ast,sys;ast.parse(sys.stdin.read())'],{input:source,encoding:'utf8'});
 assert.equal(output.status,0,label+' has Python syntax errors: '+output.stderr);
}
// If the official package cannot load, the worker still starts normal Python.
const failedSent=[];
const failingPyodide={
 ...pyodide,
 pyimport:()=>({install:async()=>{throw Error('Dependency has no WASM wheel');},destroy(){}})
};
const failureWorker={postMessage:message=>failedSent.push(message)};
runInNewContext(code,{self:failureWorker,importScripts(){},loadPyodide:async()=>failingPyodide});
await failureWorker.onmessage({data:{type:'init'}});
const failedPackage=failedSent.find(m=>m.type==='packageStatus'&&m.name==='cs50');
assert(failedPackage&&!failedPackage.success&&failedPackage.automatic,'CS50 installation failure was not surfaced');
assert(failedPackage.error.includes('WASM wheel'),'Detailed installation failure message missing');
assert(failedSent.some(m=>m.type==='ready'),'Standard Python must still start after CS50 dependency failure');

console.log('Pyodide worker contract and embedded Python syntax checks passed.');
