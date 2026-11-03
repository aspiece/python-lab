/* Python Lab smart editing: completions, Pyodide AST diagnostics, and test results. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const KEYWORDS='False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case'.split(' ');
 const BUILTINS=[
  ['print','print(*objects, sep=" ", end="\\n")','Print values to the terminal.'],
  ['input','input(prompt="")','Read a line of text from the terminal.'],
  ['len','len(object)','Return the number of items in a collection.'],
  ['range','range(start, stop, step=1)','Produce a sequence of integers.'],
  ['int','int(value)','Convert a value to an integer.'],
  ['float','float(value)','Convert a value to a floating point number.'],
  ['str','str(object)','Convert a value to a string.'],
  ['bool','bool(object)','Convert a value to True or False.'],
  ['list','list(iterable)','Build a list.'],
  ['dict','dict(**kwargs)','Build a dictionary.'],
  ['set','set(iterable)','Build a set.'],
  ['tuple','tuple(iterable)','Build a tuple.'],
  ['sum','sum(iterable, start=0)','Sum numbers.'],
  ['min','min(*args)','Find the smallest item.'],
  ['max','max(*args)','Find the largest item.'],
  ['sorted','sorted(iterable, key=None, reverse=False)','Return a new sorted list.'],
  ['enumerate','enumerate(iterable, start=0)','Produce index/value pairs.'],
  ['zip','zip(*iterables)','Combine iterables into tuples.'],
  ['open','open(file, mode="r", encoding=None)','Open a file in the project filesystem.'],
  ['abs','abs(number)','Return a number’s absolute value.'],
  ['round','round(number, ndigits=None)','Round a number.'],
  ['type','type(object)','Return the type of a value.'],
  ['isinstance','isinstance(object, classinfo)','Check whether a value is an instance of a class.'],
  ['super','super()','Access a superclass.'],
  ['Exception','Exception(message)','Base exception class for common errors.'],
  ['ValueError','ValueError(message)','Exception for an invalid value.'],
  ['FileNotFoundError','FileNotFoundError(message)','Exception for a missing file.']
 ];
 const SNIPPETS=[
  ['for','for ${1:item} in ${2:items}:\n    ${0:pass}','For loop'],
  ['if','if ${1:condition}:\n    ${0:pass}','If statement'],
  ['while','while ${1:condition}:\n    ${0:pass}','While loop'],
  ['def','def ${1:function_name}(${2:args}):\n    ${0:pass}','Function definition'],
  ['class','class ${1:ClassName}:\n    def __init__(self):\n        ${0:pass}','Class definition'],
  ['try','try:\n    ${1:pass}\nexcept ${2:Exception} as ${3:error}:\n    ${0:pass}','Try/except block'],
  ['with','with open(${1:"file.txt"}, ${2:"r"}) as ${3:file}:\n    ${0:pass}','File context manager']
 ];
 const docs=new Map(BUILTINS.map(x=>[x[0],x]));
 const state={editor:null,monaco:null,models:null,getFiles:null,getWorker:null,isReady:null,isBusy:null,openFile:null,activeFile:null,reveal:null,requestId:0,timer:null,problems:[],tests:null,view:'terminal'};
 function setView(next){
  state.view=next;state.reveal?.();
  const host=$('consoleLayout');
  if(host){host.classList.toggle('show-problems',next==='problems');host.classList.toggle('show-tests',next==='tests');}
  for(const [id,name] of [['terminalPanelBtn','terminal'],['problemsPanelBtn','problems'],['testsPanelBtn','tests']]){
   const b=$(id);if(!b)continue;b.classList.toggle('active',name===next);b.setAttribute('aria-pressed',String(next===name));
  }
 }
 function jump(path,line=1,column=1){
  if(!path||!state.openFile)return;
  state.openFile(path);
  if(state.editor){
   const pos={lineNumber:Math.max(1,line),column:Math.max(1,column)};
   state.editor.revealLineInCenter(pos.lineNumber);state.editor.setPosition(pos);state.editor.focus();
  }
 }
 function renderProblems(){
  const list=$('problemsList'),count=$('problemCount');if(count)count.textContent=String(state.problems.length);
  if(!list)return;list.textContent='';
  const problems=state.problems.slice().sort((a,b)=>a.file.localeCompare(b.file)||a.line-b.line);
  if(!problems.length){
   const message=document.createElement('p');message.className='analysis-empty';
   message.textContent='No Python syntax errors detected. This checks syntax, not logic or types.';
   list.append(message);return;
  }
  for(const p of problems){
   const row=document.createElement('button');row.className='analysis-result problem-result';
   const title=document.createElement('strong');title.textContent='✕ '+p.message;
   const location=document.createElement('span');location.className='analysis-location';
   location.textContent=p.file+':'+p.line+':'+p.column;
   row.append(title,location);row.title='Jump to '+location.textContent;
   row.onclick=()=>jump(p.file,p.line,p.column);list.append(row);
  }
 }
 function renderTests(){
  const list=$('testsList'),summary=$('testsSummary');if(!list)return;list.textContent='';
  if(!state.tests){if(summary)summary.textContent='Run Tests to collect pytest results.';return;}
  if(state.tests.running){if(summary)summary.textContent='Running pytest in the browser…';return;}
  const tests=state.tests.tests||[],total=tests.length;
  const passed=tests.filter(t=>t.outcome==='passed').length;
  const failed=tests.filter(t=>t.outcome==='failed').length;
  const skipped=tests.filter(t=>t.outcome==='skipped').length;
  const errored=tests.filter(t=>t.outcome==='error').length;
  if(summary)summary.textContent=total?passed+' passed · '+failed+' failed · '+skipped+' skipped · '+errored+' errors':'No tests collected. Review terminal output for details.';
  for(const t of tests){
   const row=document.createElement('button');row.className='analysis-result test-result '+t.outcome;
   const title=document.createElement('strong');title.textContent=(t.outcome==='passed'?'✓':t.outcome==='skipped'?'–':'✕')+' '+t.name;
   const location=document.createElement('span');location.className='analysis-location';
   location.textContent=t.file+(t.line?':'+t.line:'')+' · '+t.outcome;
   row.append(title,location);
   if(t.details){const details=document.createElement('span');details.className='test-detail';details.textContent=String(t.details).slice(0,1200);row.append(details);}
   row.onclick=()=>jump(t.file,t.line||1);list.append(row);
  }
 }
 function updateMarkers(){
  if(!state.monaco||!state.models)return;
  for(const [file,model] of state.models){
   const problems=state.problems.filter(p=>p.file===file);
   state.monaco.editor.setModelMarkers(model,'python-lab',problems.map(p=>({
    startLineNumber:p.line,startColumn:p.column,endLineNumber:p.endLine||p.line,
    endColumn:Math.max(p.column+1,p.endColumn||p.column+1),
    message:p.message,severity:state.monaco.MarkerSeverity.Error,source:'Python syntax'
   })));
  }
 }
 function onOpened(){updateMarkers();}
 function schedule(){
  if(!state.getFiles)return;
  const id=++state.requestId;clearTimeout(state.timer);
  state.timer=setTimeout(()=>{
   if(id!==state.requestId||!state.isReady?.()||state.isBusy?.())return;
   const subset={};
   for(const [path,source] of Object.entries(state.getFiles())){
    if(path.endsWith('.py')&&typeof source==='string'&&source.length<200000)subset[path]=source;
   }
   state.getWorker()?.postMessage({type:'diagnose',id,files:subset});
  },550);
 }
 function onWorkerMessage(data){
  if(data.type==='diagnostics'){
   if(data.id!==state.requestId)return;
   state.problems=(Array.isArray(data.problems)?data.problems:[]).filter(p=>p&&typeof p.file==='string');
   updateMarkers();renderProblems();
  }else if(data.type==='testResults'){
   state.tests={running:false,tests:Array.isArray(data.tests)?data.tests:[],exitCode:data.exitCode};renderTests();
  }
 }
 function beginTests(){state.tests={running:true,tests:[]};renderTests();setView('tests');}
 function registerProviders(){
  const monaco=state.monaco;
  monaco.languages.registerCompletionItemProvider('python',{
   provideCompletionItems(model,position){
    const word=model.getWordUntilPosition(position);
    const range={startLineNumber:position.lineNumber,endLineNumber:position.lineNumber,startColumn:word.startColumn,endColumn:word.endColumn};
    const suggestions=[];
    for(const keyword of KEYWORDS)suggestions.push({label:keyword,kind:monaco.languages.CompletionItemKind.Keyword,insertText:keyword,range});
    for(const [name,signature,description] of BUILTINS)suggestions.push({label:name,kind:monaco.languages.CompletionItemKind.Function,insertText:name,range,detail:signature,documentation:description});
    const identifiers=new Set(),project=state.getFiles?.()||{};
    for(const source of [model.getValue(),...Object.values(project).slice(0,25)]){
     if(typeof source!=='string'||source.length>100000)continue;
     for(const match of source.matchAll(/(?:^|\n)\s*(?:def|class)\s+([A-Za-z_]\w*)|(?:^|\n)\s*([A-Za-z_]\w*)\s*=(?!=)|(?:^|\n)\s*(?:from\s+\S+\s+import|import)\s+([A-Za-z_]\w*)/g)){
      identifiers.add(match[1]||match[2]||match[3]);
     }
    }
    for(const name of identifiers)if(name&&!KEYWORDS.includes(name)&&!docs.has(name))suggestions.push({label:name,kind:monaco.languages.CompletionItemKind.Variable,insertText:name,range,detail:'From your project'});
    for(const [label,insertText,description] of SNIPPETS)suggestions.push({label:label+' (snippet)',kind:monaco.languages.CompletionItemKind.Snippet,insertText,insertTextRules:monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,range,detail:description,sortText:'0'+label});
    return {suggestions};
   }
  });
  monaco.languages.registerHoverProvider('python',{
   provideHover(model,position){
    const word=model.getWordAtPosition(position)?.word,detail=docs.get(word);
    if(!detail)return null;return {contents:[{value:'**'+detail[1]+'**'},{value:detail[2]}]};
   }
  });
 }
 function attach(options){Object.assign(state,options);if(!state.monaco||!state.editor)return;registerProviders();onOpened();renderProblems();renderTests();schedule();}
 for(const [id,view] of [['terminalPanelBtn','terminal'],['problemsPanelBtn','problems'],['testsPanelBtn','tests']])$(id)?.addEventListener('click',()=>setView(view));
 renderProblems();renderTests();
 window.pythonLabSmart={attach,onWorkerReady:schedule,onWorkerMessage,onOpened,schedule,beginTests,setView};
})();
