/* Python Lab CS50P problem set gallery. No answer keys or solved exercises. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 let install=null;
 const source=()=>window.pythonLabCS50P;
 // Keep previously shared classroom URLs working, but do not show these
 // older examples in the new CS50P-only gallery.
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
  },
  "cs50p-style": {
    "title": "CS50P-Style Practice",
    "description": "A small beginner problem with a clean main() pattern.",
    "files": {
      "main.py": "def main():\n    answer = input(\"What is the answer? \").strip().lower()\n    print(check_answer(answer))\n\n\ndef check_answer(answer):\n    if answer in (\"42\", \"forty-two\", \"forty two\"):\n        return \"Yes\"\n    return \"No\"\n\n\nif __name__ == \"__main__\":\n    main()\n",
      "test_main.py": "from main import check_answer\n\n\ndef test_valid_answers():\n    assert check_answer(\"42\") == \"Yes\"\n    assert check_answer(\"forty-two\") == \"Yes\"\n\n\ndef test_invalid_answers():\n    assert check_answer(\"41\") == \"No\"\n",
      "README.md": "# CS50P-Style Practice\nPractice string normalization, writing main(), and testing functions.\nThis is an original practice activity, not an official Harvard assignment or grading environment.\nUse the official CS50 environment for check50 and submit50.\n"
    }
  }
};
 function show(){
  const dialog=$('templatesDialog');
  render();
  if(dialog?.showModal&&!dialog.open)dialog.showModal();
 }
 function get(id){
  const official=source()?.get(id);
  if(official)return official;
  const old=legacy[id];
  return old?{id,entryFile:'main.py',...JSON.parse(JSON.stringify(old))}:null;
 }
 function assignmentUrl(id){
  if(!get(id))throw Error('Unknown starter project');
  const url=new URL(window.location.href);
  url.search='';url.hash='';
  url.searchParams.set('starter',id);
  url.searchParams.set('assignment',Math.random().toString(36).slice(2,12));
  return url.toString();
 }
 async function copyLink(problem,button){
  const link=assignmentUrl(problem.id);
  try{
   if(typeof navigator!=='undefined'&&navigator.clipboard?.writeText){
    await navigator.clipboard.writeText(link);
    button.textContent='Copied for Canvas';
    return;
   }
  }catch{}
  const fallback=prompt('Copy this starter link into Canvas:',link);
  if(fallback!==null)button.textContent='Link available';
 }
 function render(){
  const host=$('templateGallery');if(!host)return;
  host.textContent='';
  const library=source();
  if(!library){
   const info=document.createElement('p');
   info.textContent='CS50P starter library is unavailable. Reload the page and try again.';
   host.append(info);return;
  }
  const selected=String($('templateSetFilter')?.value||'all');
  const query=String($('templateSearch')?.value||'').trim().toLowerCase();
  const matches=library.catalog().filter(problem=>
   (selected==='all'||String(problem.set)===selected) &&
   (!query||[problem.title,problem.description,problem.filename,'pset '+problem.set].some(text=>text.toLowerCase().includes(query)))
  );
  const count=$('templateCount');
  if(count)count.textContent=matches.length+' of '+library.catalog().length+' CS50P problems';
  if(!matches.length){
   const message=document.createElement('p');message.className='analysis-empty';
   message.textContent='No matching problems. Try a different set or search term.';
   host.append(message);return;
  }
  let currentSet=null;
  for(const problem of matches){
   if(currentSet!==problem.set){
    currentSet=problem.set;
    const heading=document.createElement('h4');heading.className='template-set-heading';
    heading.textContent='Problem Set '+problem.set+' · '+problem.subject;
    host.append(heading);
   }
   const card=document.createElement('div');card.className='template-option';
   const start=document.createElement('button');start.className='template-choice';
   const label=document.createElement('strong');label.textContent=problem.title;
   const metadata=document.createElement('span');metadata.className='template-filename';
   metadata.textContent=(problem.folderName||problem.slug||problem.id)+'/'+problem.filename;
   const description=document.createElement('span');description.textContent=problem.description;
   start.append(label,metadata,description);
   start.title='Create '+problem.title+' as a new project folder';
   start.onclick=()=>{
    const result=install?.(get(problem.id));
    if(result)$('templatesDialog')?.close?.();
   };
   const actions=document.createElement('div');actions.className='template-card-actions';
   const link=document.createElement('a');link.className='template-official-link';
   link.textContent='Official instructions';
   link.href=problem.url;link.target='_blank';link.rel='noopener noreferrer';
   const share=document.createElement('button');share.className='template-link';
   share.textContent='Copy assignment link';
   share.title='Share this unsolved starter in Canvas';
   share.onclick=()=>copyLink(problem,share);
   actions.append(link,share);
   card.append(start,actions);host.append(card);
  }
 }
 function populateFilters(){
  const select=$('templateSetFilter');if(!select)return;
  select.textContent='';
  const library=source();
  const options=[['all','All problem sets'],...(library?.subjects||[]).map((subject,i)=>[String(i),'Set '+i+' · '+subject])];
  for(const [value,label] of options){
   const option=document.createElement('option');option.value=value;option.textContent=label;
   select.append(option);
  }
  select.value='all';
 }
 $('templateBtn')?.addEventListener('click',show);
 $('templateClose')?.addEventListener('click',()=> $('templatesDialog')?.close?.());
 $('templateSearch')?.addEventListener('input',render);
 $('templateSetFilter')?.addEventListener('change',render);
 function attach(callback){install=callback;populateFilters();render();}
 window.pythonLabTemplates={
  attach,show,get,assignmentUrl,render,
  catalog:()=>source()?.catalog()||[]
 };
})();
