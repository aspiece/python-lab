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
  },
  "trace-boss-battle": {
   title:"Boss Battle",
   folderName:"trace-boss-battle",
   description:"How many hits will the boss take? What is its final health?",
   code:"health = 10\nwhile health > 0:\n    health -= 3\n    print(health)\n",
   task:"How many hits will the boss take? What is its final health?",
   challenge:"Change the damage from 3 to 4. Predict and test how many hits it takes."
  },
  "trace-track-countdown": {
   title:"Track Countdown",
   folderName:"trace-track-countdown",
   description:"Which countdown values will print?",
   code:"seconds = 12\nwhile seconds > 0:\n    print(seconds)\n    seconds -= 3\n",
   task:"Which countdown values will print?",
   challenge:"Change the loop so it also prints 0. Predict and test what happens when seconds starts at 0."
  },
  "trace-xp-tracker": {
   title:"XP Tracker",
   folderName:"trace-xp-tracker",
   description:"Predict the running XP total after each round.",
   code:"total_xp = 0\nfor xp in range(10, 41, 10):\n    total_xp += xp\n    print(total_xp)\n",
   task:"Predict the running XP total after each round.",
   challenge:"Change the range so there is a fifth round worth 50 XP. Predict and test the new final total."
  },
  "trace-beat-counter": {
   title:"Beat Counter",
   folderName:"trace-beat-counter",
   description:"Which beat numbers will print?",
   code:"for beat in range(1, 9):\n    print(beat)\n",
   task:"Which beat numbers will print?",
   challenge:"Change the range so it prints only beats 2, 4, 6, and 8."
  },
  "trace-loot-scanner": {
   title:"Loot Scanner",
   folderName:"trace-loot-scanner",
   description:"Which items are collected? What is skipped, and what ends the search?",
   code:"loot = [\"coins\", \"broken sword\", \"potion\", \"legendary shield\", \"gem\"]\nfor item in loot:\n    if item == \"broken sword\":\n        continue\n    if item == \"legendary shield\":\n        break\n    print(\"Collected:\", item)\n",
   task:"Which items are collected? What is skipped, and what ends the search?",
   challenge:"Move the legendary shield before the potion. Predict and test which items are collected now."
  },
  "trace-playlist-preview": {
   title:"Playlist Preview",
   folderName:"trace-playlist-preview",
   description:"Which tracks play? Where does the preview stop?",
   code:"playlist = [\"Opening Beat\", \"skip\", \"Bass Drop\", \"end\", \"Encore\"]\nfor track in playlist:\n    if track == \"skip\":\n        continue\n    if track == \"end\":\n        break\n    print(\"Playing:\", track)\n",
   task:"Which tracks play? Where does the preview stop?",
   challenge:"Move end to the last spot. Predict and test which tracks play now."
  },
  "trace-enemy-waves": {
   title:"Enemy Waves",
   folderName:"trace-enemy-waves",
   description:"How many enemies spawn? When does the enemy number restart?",
   code:"for wave in range(1, 3):\n    for enemy in range(1, 4):\n        print(\"Wave\", wave, \"Enemy\", enemy)\n",
   task:"How many enemies spawn? When does the enemy number restart?",
   challenge:"Change the inner loop to spawn four enemies per wave. Predict and test the new total."
  },
  "trace-drum-machine": {
   title:"Drum Machine",
   folderName:"trace-drum-machine",
   description:"How many beats print? When does the beat number restart?",
   code:"for measure in range(1, 3):\n    for beat in range(1, 5):\n        print(\"Measure\", measure, \"Beat\", beat)\n",
   task:"How many beats print? When does the beat number restart?",
   challenge:"Change the inner loop to print three beats per measure. Predict and test the new total."
  }
 };
 function tracingStarter(id){
  if(!Object.hasOwn(tracing,id))return null;
  const {title,folderName,description,code,task,challenge}=tracing[id];
  const directions=[
   '# '+title,
   '![Loop steps for '+title+'](assets/loop-guides/'+id+'.png)',
   'Predict the output in your student notes before you run the code.',
   task,
   'Select main.py and click Run to see the output.',
   'To trace, choose Debug → Record Trace, then use Next to step through the code.',
   'Compare the trace with your prediction. Record the actual output in your notes.',
   ...(challenge?['Change and test: '+challenge]:[])
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
