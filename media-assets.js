/* Binary assets stay separate from editable text files throughout the workspace. */
(() => {
 'use strict';
 const types={png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',bmp:'image/bmp',wav:'audio/wav',mp3:'audio/mpeg',ogg:'audio/ogg'};
 const MAX_FILE=8*1024*1024,MAX_TOTAL=24*1024*1024;
 const extension=path=>String(path).split('.').pop().toLowerCase();
 const mime=path=>types[extension(path)]||'';
 const bytes=asset=>Uint8Array.from(atob(asset.base64),c=>c.charCodeAt(0));
 const encode=data=>{let s='';for(let i=0;i<data.length;i=i+16384)s+=String.fromCharCode(...data.subarray(i,i+16384));return btoa(s);};
 function fromBytes(path,data){
  const type=mime(path);if(!type)throw Error('Use PNG, JPG, GIF, WebP, BMP, WAV, MP3, or OGG.');
  if(!data.length||data.length>MAX_FILE)throw Error(path+': files must be between 1 byte and 8 MB.');
  const tag=(a,b)=>String.fromCharCode(...data.slice(a,b));
  const ext=extension(path);
  const valid=ext==='png'?data[0]===137&&tag(1,4)==='PNG':ext==='jpg'||ext==='jpeg'?data[0]===255&&data[1]===216:ext==='gif'?tag(0,3)==='GIF':ext==='bmp'?tag(0,2)==='BM':ext==='webp'?tag(0,4)==='RIFF'&&tag(8,12)==='WEBP':ext==='wav'?tag(0,4)==='RIFF'&&tag(8,12)==='WAVE':ext==='ogg'?tag(0,4)==='OggS':tag(0,3)==='ID3'||data[0]===255&&(data[1]&224)===224;
  if(!valid)throw Error(path+': the file contents do not match its extension.');
  return {mime:type,size:data.length,base64:encode(data)};
 }
 function valid(asset){return !!asset&&typeof asset.base64==='string'&&asset.base64.length===4*Math.ceil(asset.size/3)&&/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(asset.base64)&&Number.isInteger(asset.size)&&asset.size>0&&asset.size<=MAX_FILE&&Object.values(types).includes(asset.mime);}
 function total(assets){return Object.values(assets).reduce((n,a)=>n+(a.size||0),0);}
 function name(original){
  const ext=extension(original);let stem=String(original).slice(0,-ext.length-1).toLowerCase().replace(/[^a-z0-9_]+/g,'_').replace(/^_+|_+$/g,'')||'asset';
  if(/^\d/.test(stem))stem='asset_'+stem;
  return stem.slice(0,70)+'.'+ext;
 }
 function unique(path,exists){const dot=path.lastIndexOf('.'),stem=path.slice(0,dot),ext=path.slice(dot);let result=path,n=2;while(exists(result)){result=stem+'_'+n+ext;n++;}return result;}
 function preview(path,asset){
  const host=document.getElementById('assetPreviewBody');host.textContent='';
  const media=document.createElement(asset.mime.startsWith('image/')?'img':'audio');
  media.src='data:'+asset.mime+';base64,'+asset.base64;
  if(asset.mime.startsWith('image/'))media.alt=path;else media.controls=true;
  host.append(media);
  document.getElementById('assetPreviewTitle').textContent=path+' · '+Math.ceil(asset.size/1024)+' KB';
  const help=document.createElement('pre');
  const stem=path.split('/').pop().replace(/\.[^.]+$/,'');
  help.textContent=asset.mime.startsWith('image/')?'Pygame: pygame.image.load("'+path+'")\nPygame Zero (images/): Actor("'+stem+'")':path.startsWith('music/')?'Pygame: pygame.mixer.music.load("'+path+'")\nPygame Zero: music.play("'+stem+'")':'Pygame: pygame.mixer.Sound("'+path+'")\nPygame Zero (sounds/): sounds.'+stem+'.play()';
  const note=document.createElement('p');note.textContent='Paths are relative to your running script folder. Pygame Zero expects images/, sounds/, and music/ beside that script. GIFs display as a still image. Click Enable audio in the game before playing sounds.';host.append(note);
  host.append(help);document.getElementById('assetPreviewDialog').showModal();
 }
 function readZip(entry,limit){
  // Stop decompression once the per-file limit is exceeded.
  return new Promise((resolve,reject)=>{let size=0,parts=[];const stream=entry.internalStream('uint8array');stream.on('data',chunk=>{size+=chunk.length;if(size>limit){stream.pause();reject(Error('ZIP entry exceeds its size limit: '+entry.name));return;}parts.push(chunk);}).on('error',reject).on('end',()=>{const result=new Uint8Array(size);let offset=0;for(const p of parts){result.set(p,offset);offset+=p.length;}resolve(result);}).resume();});
 }
 window.pythonLabAssets={mime,bytes,fromBytes,valid,total,name,unique,preview,readZip,MAX_FILE,MAX_TOTAL};
})();
