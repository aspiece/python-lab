import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const window={};
runInNewContext(read('media-assets.js'),{window,Uint8Array,atob,btoa});
const a=window.pythonLabAssets;
const png=Uint8Array.from([137,80,78,71,13,10,26,10]);
const asset=a.fromBytes('tile.png',png);
assert.deepEqual([...a.bytes(asset)],[...png]);assert(a.valid(asset));
assert(!a.valid({...asset,size:100}));assert(!a.valid({...asset,base64:'!!!!!!!!!!!!'}));
assert.throws(()=>a.fromBytes('tile.wav',png),/extension/);
assert.throws(()=>a.fromBytes('tile.svg',png),/Use PNG/);
assert.throws(()=>a.fromBytes('tile.png',new Uint8Array(a.MAX_FILE+1)),/8 MB/);
assert.equal(a.name('12 Space Ship.PNG'),'asset_12_space_ship.png');
assert.equal(a.unique('images/tile.png',p=>['images/tile.png','images/tile_2.png'].includes(p)),'images/tile_3.png');
function entry(chunks){return {name:'image.png',internalStream(){const handlers={};let paused=false;return {on(event,fn){handlers[event]=fn;return this;},pause(){paused=true;},resume(){for(const chunk of chunks){if(paused)return;handlers.data(chunk);}if(!paused)handlers.end();}};}};}
assert.deepEqual([...await a.readZip(entry([png]),10)],[...png]);
await assert.rejects(a.readZip(entry([png,png]),10),/size limit/);
// Exercise the real game preloader against the Emscripten filesystem contract.
const writes=[],plugins=[{canHandle:p=>p.endsWith('.png')}];
const context={document:{getElementById:()=>({addEventListener(){}}),querySelectorAll:()=>[]},
 window:{addEventListener(){}},location:{origin:'https://lab.test'},parent:{postMessage(){}},performance:{now:()=>0},
 setInterval:()=>1,setTimeout,clearTimeout,Uint8Array,atob};
runInNewContext(read('pygame-runner.js'),context);
const py={FS:{mkdirTree(){}},_module:{preloadPlugins:plugins,FS_createPreloadedFile(dir,name,data,r,w,done){writes.push({dir,name,data});done();}}};
await context.preloadAssets(py,{'images/tile.png':asset},{});
assert.equal(writes[0].dir,'/home/pyodide/images');assert.deepEqual([...writes[0].data],[...png]);
assert(plugins[0].canHandle('tile.webp'));assert(plugins[0].canHandle('tile.gif'));
await assert.rejects(context.preloadAssets(py,{'../tile.png':asset},{}),/path/);
await assert.rejects(context.preloadAssets(py,{'tile.png':asset},{'tile.png':'text'}),/path/);
console.log('Media validation, binary roundtrip, naming, bounded ZIP extraction and SDL preloading passed.');
