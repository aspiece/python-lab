/* Python Lab classroom templates; no CS50 problem-set starter catalog. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 let install=null;
 const legacy={
  "hello-world": {
    "title": "Hello, Python!",
    "description": "Variables, input, formatted strings, and output.",
    "files": {
      "main.py": "# Change the greeting and try your own name.\nname = input(\"What is your name? \")\nprint(f\"Hello, {name}!\")\n",
      "README.md": "# Hello, Python!\nRun main.py. Change the greeting, add a second question, and print both answers.\n"
    }
  },
  "loops-lists": {
    "title": "Loops and Lists",
    "description": "Practice lists, for loops, and accumulating totals.",
    "files": {
      "main.py": "# Predict the output, then run the code.\nscores = [8, 10, 7, 9]\ntotal = 0\nfor score in scores:\n    total += score\n    print(f\"Added {score}; running total = {total}\")\nprint(f\"Average = {total / len(scores):.1f}\")\n",
      "README.md": "# Loops and Lists\nSet a breakpoint inside the for loop, then record a trace. Observe how total changes.\nChallenge: find the highest score without using max().\n"
    }
  },
  "functions-tests": {
    "title": "Functions and Tests",
    "description": "Write functions and run pytest with sample tests.",
    "files": {
      "main.py": "def square(number):\n    return number * number\n\n\ndef is_even(number):\n    return number % 2 == 0\n\n\nif __name__ == \"__main__\":\n    print(square(5))\n    print(is_even(6))\n",
      "test_main.py": "from main import square, is_even\n\n\ndef test_square():\n    assert square(4) == 16\n    assert square(-3) == 9\n\n\ndef test_is_even():\n    assert is_even(8)\n    assert not is_even(7)\n",
      "README.md": "# Functions and Tests\nRun main.py, then choose Tests to run test_main.py. Change a function deliberately and look at the failed test.\n"
    }
  }
};
 const tracing={
  'trace-while-loops': {
   title:'Trace a While Loop',
   folderName:'trace-while-loops',
   description:'Track the condition, output, and next value in a countdown.',
   code:'number = 3\nwhile number > 0:\n    print(number)\n    number -= 1\n',
   task:'Record the number, whether the condition is true, what prints, and the next number. Include the final check.'
  },
  'trace-for-loops': {
   title:'Trace a For Loop',
   folderName:'trace-for-loops',
   description:'Watch the loop variable and running total change.',
   code:'total = 0\nfor number in range(1, 6, 2):\n    total = total + number\nprint(total)\n',
   task:'Write down the values from range(). Record the total before and after each addition.'
  },
  'trace-break-continue': {
   title:'Trace Break and Continue',
   folderName:'trace-break-continue',
   description:'Compare skipping a pass with stopping a loop.',
   code:'for i in range(5):\n    if i == 2:\n        continue\n    print(i)\nprint("Done")\n',
   task:'Trace continue first. Then change continue to break, predict what will print, and record a new trace.'
  },
  'trace-nested-loops': {
   title:'Trace Nested Loops',
   folderName:'trace-nested-loops',
   description:'Track each row and column in the order they print.',
   code:'for row in range(2):\n    for column in range(3):\n        print(row, column)\n',
   task:'Record the pairs in print order. Watch when column starts over.'
  }
 };
 function tracingStarter(id){
  if(!Object.hasOwn(tracing,id))return null;
  const {title,folderName,description,code,task}=tracing[id];
  const directions=[
   '# '+title,
   'Predict the output in your student notes before you run the code.',
   task,
   'With main.py open, choose Debug, then Record Trace. Use Next to step through the code. Check Variables and Output as you go.',
   'Compare the trace with your prediction. Record the actual output in your notes.'
  ].join('\n\n');
  return {id,title,folderName,description,entryFile:'main.py',files:{'main.py':code,'README.md':directions+'\n'}};
 }

 function catalog(){
  const originals=Object.keys(legacy).map(id=>({
   id,title:legacy[id].title,description:legacy[id].description,
   filename:'main.py',folderName:id,entryFile:'main.py'
  }));
  const traces=Object.keys(tracing).map(id=>({
   id,title:tracing[id].title,description:tracing[id].description,
   filename:'main.py',folderName:id,entryFile:'main.py'
  }));
  return [...originals,...traces];
 }
 function get(id){
  const trace=tracingStarter(id);
  if(trace)return trace;
  const item=legacy[id];
  return item?{id,folderName:id,entryFile:'main.py',...JSON.parse(JSON.stringify(item))}:null;
 }
 function show(){
  render();
  const dialog=$('templatesDialog');
  if(dialog?.showModal&&!dialog.open)dialog.showModal();
 }
 function assignmentUrl(id){
  if(!get(id))throw Error('Unknown starter project');
  const url=new URL(window.location.href);
  url.search='';url.hash='';
  url.searchParams.set('starter',id);
  url.searchParams.set('assignment',Math.random().toString(36).slice(2,12));
  return url.toString();
 }
 async function copyLink(item,button){
  const link=assignmentUrl(item.id);
  try{
   if(typeof navigator!=='undefined'&&navigator.clipboard?.writeText){
    await navigator.clipboard.writeText(link);
    button.textContent='Copied for Canvas';
    return;
   }
  }catch{}
  const result=prompt('Copy this starter link into Canvas:',link);
  if(result!==null)button.textContent='Link available';
 }
 function render(){
  const host=$('templateGallery');if(!host)return;
  host.textContent='';
  const q=String($('templateSearch')?.value||'').trim().toLowerCase();
  const all=catalog();
  const found=all.filter(item=>!q||
   [item.title,item.description,item.filename].some(value=>value.toLowerCase().includes(q)));
  const count=$('templateCount');
  if(count)count.textContent=found.length+' of '+all.length+' general Python templates';
  if(!found.length){
   const p=document.createElement('p');
   p.className='analysis-empty';
   p.textContent='No matching templates. Try a different search.';
   host.append(p);return;
  }
  for(const item of found){
   const card=document.createElement('div');card.className='template-option';
   const start=document.createElement('button');start.className='template-choice';
   const label=document.createElement('strong');label.textContent=item.title;
   const filename=document.createElement('span');filename.className='template-filename';
   filename.textContent=item.folderName+'/main.py';
   const description=document.createElement('span');description.textContent=item.description;
   start.append(label,filename,description);
   start.title='Create '+item.title+' in a separate folder';
   start.onclick=()=>{
    if(install?.(get(item.id)))$('templatesDialog')?.close?.();
   };
   const actions=document.createElement('div');actions.className='template-card-actions';
   const share=document.createElement('button');share.className='template-link';
   share.textContent='Copy starter link';
   share.title='Share this starter project in Canvas';
   share.onclick=()=>copyLink(item,share);
   actions.append(share);
   card.append(start,actions);host.append(card);
  }
 }
 function attach(callback){install=callback;render();}
 $('templateBtn')?.addEventListener('click',show);
 $('templateClose')?.addEventListener('click',()=>$('templatesDialog')?.close?.());
 $('templateSearch')?.addEventListener('input',render);
 window.pythonLabTemplates={attach,show,get,assignmentUrl,render,catalog};
})();
