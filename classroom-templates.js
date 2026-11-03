/* Classroom starter projects. Files are created locally; no login required. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const projects=[
  {id:'hello-world',title:'Hello, Python!',description:'Variables, input, formatted strings, and output.',
   files:{
    'main.py':'# Change the greeting and try your own name.\nname = input("What is your name? ")\nprint(f"Hello, {name}!")\n',
    'README.md':'# Hello, Python!\nRun main.py. Change the greeting, add a second question, and print both answers.\n'
   }},
  {id:'loops-lists',title:'Loops and Lists',description:'Practice lists, for loops, and accumulating totals.',
   files:{
    'main.py':'# Predict the output, then run the code.\nscores = [8, 10, 7, 9]\ntotal = 0\nfor score in scores:\n    total += score\n    print(f"Added {score}; running total = {total}")\nprint(f"Average = {total / len(scores):.1f}")\n',
    'README.md':'# Loops and Lists\nSet a breakpoint inside the for loop, then record a trace. Observe how total changes.\nChallenge: find the highest score without using max().\n'
   }},
  {id:'functions-tests',title:'Functions and Tests',description:'Write functions and run pytest with sample tests.',
   files:{
    'main.py':'def square(number):\n    return number * number\n\n\ndef is_even(number):\n    return number % 2 == 0\n\n\nif __name__ == "__main__":\n    print(square(5))\n    print(is_even(6))\n',
    'test_main.py':'from main import square, is_even\n\n\ndef test_square():\n    assert square(4) == 16\n    assert square(-3) == 9\n\n\ndef test_is_even():\n    assert is_even(8)\n    assert not is_even(7)\n',
    'README.md':'# Functions and Tests\nRun main.py, then choose Tests to run test_main.py. Change a function deliberately and look at the failed test.\n'
   }},
  {id:'cs50p-style',title:'CS50P-Style Practice',description:'A small beginner problem with a clean main() pattern.',
   files:{
    'main.py':'def main():\n    answer = input("What is the answer? ").strip().lower()\n    print(check_answer(answer))\n\n\ndef check_answer(answer):\n    if answer in ("42", "forty-two", "forty two"):\n        return "Yes"\n    return "No"\n\n\nif __name__ == "__main__":\n    main()\n',
    'test_main.py':'from main import check_answer\n\n\ndef test_valid_answers():\n    assert check_answer("42") == "Yes"\n    assert check_answer("forty-two") == "Yes"\n\n\ndef test_invalid_answers():\n    assert check_answer("41") == "No"\n',
    'README.md':'# CS50P-Style Practice\nPractice string normalization, writing main(), and testing functions.\nThis is an original practice activity, not an official Harvard assignment or grading environment.\nUse the official CS50 environment for check50 and submit50.\n'
   }}
 ];
 let install=null;
 function show(){
  const dialog=$('templatesDialog');
  if(dialog?.showModal)dialog.showModal();
 }
 function get(id){
  const project=projects.find(p=>p.id===id);
  return project?JSON.parse(JSON.stringify(project)):null;
 }
 function assignmentUrl(id){
  const url=new URL(window.location.href);
  url.search='';url.hash='';
  url.searchParams.set('starter',id);
  url.searchParams.set('assignment',Math.random().toString(36).slice(2,12));
  return url.toString();
 }
 async function copyLink(project,button){
  const link=assignmentUrl(project.id);
  let copied=false;
  try{
   if(typeof navigator!=='undefined'&&navigator.clipboard?.writeText){
    await navigator.clipboard.writeText(link);copied=true;
   }
  }catch{}
  if(copied){button.textContent='Copied! Share in Canvas';}
  else{
   prompt('Copy this assignment starter link and paste it into Canvas:',link);
   button.textContent='Link ready';
  }
 }
 function render(){
  const host=$('templateGallery');if(!host)return;host.textContent='';
  for(const project of projects){
   const item=document.createElement('div');item.className='template-option';
   const btn=document.createElement('button');btn.className='template-choice';
   const label=document.createElement('strong');label.textContent=project.title;
   const description=document.createElement('span');description.textContent=project.description;
   btn.append(label,description);
   btn.onclick=()=>{
    if(install?.(project))$('templatesDialog')?.close?.();
   };
   const link=document.createElement('button');link.className='template-link';
   link.textContent='Copy assignment link';link.title='Copy a starter link for students';
   link.onclick=()=>copyLink(project,link);
   item.append(btn,link);host.append(item);
  }
 }
 $('templateBtn')?.addEventListener('click',show);
 $('templateClose')?.addEventListener('click',()=> $('templatesDialog')?.close?.());
 function attach(callback){install=callback;render();}
 window.pythonLabTemplates={
  attach,show,get,assignmentUrl,
  catalog:()=>projects.map(x=>({id:x.id,title:x.title,files:Object.keys(x.files)}))
 };
})();
