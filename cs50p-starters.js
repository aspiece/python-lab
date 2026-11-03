/* Original unsolved CS50P learning scaffolds for Python Lab.
 * Assignment names, filenames, and links correspond to Harvard's official
 * CS50P Problem Sets 0-8. Code and teaching prompts are newly authored.
 */
(() => {
 'use strict';
 const subjects=["Functions & Variables","Conditionals","Loops","Exceptions","Libraries","Unit Tests","File I/O","Regular Expressions","OOP"];
 const catalog=[
 {
  "id": "cs50p-0-indoor",
  "set": 0,
  "slug": "indoor",
  "title": "Indoor Voice",
  "filename": "indoor.py",
  "goal": "Read a string and produce its lowercase equivalent.",
  "functions": [],
  "sourceFile": null,
  "testFile": null,
  "url": "https://cs50.harvard.edu/python/psets/0/indoor/"
 },
 {
  "id": "cs50p-0-playback",
  "set": 0,
  "slug": "playback",
  "title": "Playback Speed",
  "filename": "playback.py",
  "goal": "Practice replacing spaces in a string.",
  "functions": [],
  "sourceFile": null,
  "testFile": null,
  "url": "https://cs50.harvard.edu/python/psets/0/playback/"
 },
 {
  "id": "cs50p-0-faces",
  "set": 0,
  "slug": "faces",
  "title": "Making Faces",
  "filename": "faces.py",
  "goal": "Write convert(text) and a main function.",
  "functions": [
   "convert(text)"
  ],
  "sourceFile": null,
  "testFile": null,
  "url": "https://cs50.harvard.edu/python/psets/0/faces/"
 },
 {
  "id": "cs50p-0-einstein",
  "set": 0,
  "slug": "einstein",
  "title": "Einstein",
  "filename": "einstein.py",
  "goal": "Read mass and calculate an energy value.",
  "functions": [],
  "sourceFile": null,
  "testFile": null,
  "url": "https://cs50.harvard.edu/python/psets/0/einstein/"
 },
 {
  "id": "cs50p-0-tip",
  "set": 0,
  "slug": "tip",
  "title": "Tip Calculator",
  "filename": "tip.py",
  "goal": "Write the two currency and percentage conversion helpers.",
  "functions": [
   "dollars_to_float(d)",
   "percent_to_float(p)"
  ],
  "sourceFile": null,
  "testFile": null,
  "url": "https://cs50.harvard.edu/python/psets/0/tip/"
 },
 {
  "id": "cs50p-1-deep",
  "set": 1,
  "slug": "deep",
  "title": "Deep Thought",
  "filename": "deep.py",
  "goal": "Practice conditionals and normalized user input.",
  "functions": [],
  "sourceFile": null,
  "testFile": null,
  "url": "https://cs50.harvard.edu/python/psets/1/deep/"
 },
 {
  "id": "cs50p-1-bank",
  "set": 1,
  "slug": "bank",
  "title": "Home Federal Savings Bank",
  "filename": "bank.py",
  "goal": "Use string checks and ordered conditions.",
  "functions": [],
  "sourceFile": null,
  "testFile": null,
  "url": "https://cs50.harvard.edu/python/psets/1/bank/"
 },
 {
  "id": "cs50p-1-extensions",
  "set": 1,
  "slug": "extensions",
  "title": "File Extensions",
  "filename": "extensions.py",
  "goal": "Classify filename extensions using conditions.",
  "functions": [],
  "sourceFile": null,
  "testFile": null,
  "url": "https://cs50.harvard.edu/python/psets/1/extensions/"
 },
 {
  "id": "cs50p-1-interpreter",
  "set": 1,
  "slug": "interpreter",
  "title": "Math Interpreter",
  "filename": "interpreter.py",
  "goal": "Parse two values and an operator from input.",
  "functions": [],
  "sourceFile": null,
  "testFile": null,
  "url": "https://cs50.harvard.edu/python/psets/1/interpreter/"
 },
 {
  "id": "cs50p-1-meal",
  "set": 1,
  "slug": "meal",
  "title": "Meal Time",
  "filename": "meal.py",
  "goal": "Implement convert(time) for a 24-hour time string.",
  "functions": [
   "convert(time)"
  ],
  "sourceFile": null,
  "testFile": null,
  "url": "https://cs50.harvard.edu/python/psets/1/meal/"
 },
 {
  "id": "cs50p-2-camel",
  "set": 2,
  "slug": "camel",
  "title": "camelCase",
  "filename": "camel.py",
  "goal": "Loop over characters to transform a name.",
  "functions": [],
  "sourceFile": null,
  "testFile": null,
  "url": "https://cs50.harvard.edu/python/psets/2/camel/"
 },
 {
  "id": "cs50p-2-coke",
  "set": 2,
  "slug": "coke",
  "title": "Coke Machine",
  "filename": "coke.py",
  "goal": "Repeatedly accept coins and track the balance.",
  "functions": [],
  "sourceFile": null,
  "testFile": null,
  "url": "https://cs50.harvard.edu/python/psets/2/coke/"
 },
 {
  "id": "cs50p-2-twttr",
  "set": 2,
  "slug": "twttr",
  "title": "Just setting up my twttr",
  "filename": "twttr.py",
  "goal": "Filter selected letters out of a string.",
  "functions": [],
  "sourceFile": null,
  "testFile": null,
  "url": "https://cs50.harvard.edu/python/psets/2/twttr/"
 },
 {
  "id": "cs50p-2-plates",
  "set": 2,
  "slug": "plates",
  "title": "Vanity Plates",
  "filename": "plates.py",
  "goal": "Create is_valid(s) to validate a plate string.",
  "functions": [
   "is_valid(s)"
  ],
  "sourceFile": null,
  "testFile": null,
  "url": "https://cs50.harvard.edu/python/psets/2/plates/"
 },
 {
  "id": "cs50p-2-nutrition",
  "set": 2,
  "slug": "nutrition",
  "title": "Nutrition Facts",
  "filename": "nutrition.py",
  "goal": "Look up nutrition information using a dictionary.",
  "functions": [],
  "sourceFile": null,
  "testFile": null,
  "url": "https://cs50.harvard.edu/python/psets/2/nutrition/"
 },
 {
  "id": "cs50p-3-fuel",
  "set": 3,
  "slug": "fuel",
  "title": "Fuel Gauge",
  "filename": "fuel.py",
  "goal": "Validate a fraction, catch bad input, and format a gauge.",
  "functions": [],
  "sourceFile": null,
  "testFile": null,
  "url": "https://cs50.harvard.edu/python/psets/3/fuel/"
 },
 {
  "id": "cs50p-3-taqueria",
  "set": 3,
  "slug": "taqueria",
  "title": "Felipe's Taqueria",
  "filename": "taqueria.py",
  "goal": "Track orders and a running total using a dictionary.",
  "functions": [],
  "sourceFile": null,
  "testFile": null,
  "url": "https://cs50.harvard.edu/python/psets/3/taqueria/"
 },
 {
  "id": "cs50p-3-grocery",
  "set": 3,
  "slug": "grocery",
  "title": "Grocery List",
  "filename": "grocery.py",
  "goal": "Count repeated items until end-of-input.",
  "functions": [],
  "sourceFile": null,
  "testFile": null,
  "url": "https://cs50.harvard.edu/python/psets/3/grocery/"
 },
 {
  "id": "cs50p-3-outdated",
  "set": 3,
  "slug": "outdated",
  "title": "Outdated",
  "filename": "outdated.py",
  "goal": "Parse and normalize date formats, retrying invalid entries.",
  "functions": [],
  "sourceFile": null,
  "testFile": null,
  "url": "https://cs50.harvard.edu/python/psets/3/outdated/"
 },
 {
  "id": "cs50p-4-emojize",
  "set": 4,
  "slug": "emojize",
  "title": "Emojize",
  "filename": "emojize.py",
  "goal": "Use the emoji package to transform names into emoji.",
  "functions": [],
  "sourceFile": null,
  "testFile": null,
  "url": "https://cs50.harvard.edu/python/psets/4/emojize/"
 },
 {
  "id": "cs50p-4-figlet",
  "set": 4,
  "slug": "figlet",
  "title": "Frank, Ian and Glen's Letters",
  "filename": "figlet.py",
  "goal": "Use command-line arguments and a FIGlet font.",
  "functions": [],
  "sourceFile": null,
  "testFile": null,
  "url": "https://cs50.harvard.edu/python/psets/4/figlet/"
 },
 {
  "id": "cs50p-4-adieu",
  "set": 4,
  "slug": "adieu",
  "title": "Adieu, Adieu",
  "filename": "adieu.py",
  "goal": "Use an inflection library to format a list of names.",
  "functions": [],
  "sourceFile": null,
  "testFile": null,
  "url": "https://cs50.harvard.edu/python/psets/4/adieu/"
 },
 {
  "id": "cs50p-4-game",
  "set": 4,
  "slug": "game",
  "title": "Guessing Game",
  "filename": "game.py",
  "goal": "Use random numbers, validation, and a guessing loop.",
  "functions": [],
  "sourceFile": null,
  "testFile": null,
  "url": "https://cs50.harvard.edu/python/psets/4/game/"
 },
 {
  "id": "cs50p-4-professor",
  "set": 4,
  "slug": "professor",
  "title": "Little Professor",
  "filename": "professor.py",
  "goal": "Write get_level() and generate_integer(level).",
  "functions": [
   "get_level()",
   "generate_integer(level)"
  ],
  "sourceFile": null,
  "testFile": null,
  "url": "https://cs50.harvard.edu/python/psets/4/professor/"
 },
 {
  "id": "cs50p-4-bitcoin",
  "set": 4,
  "slug": "bitcoin",
  "title": "Bitcoin Price Index",
  "filename": "bitcoin.py",
  "goal": "Read a CLI argument and handle an HTTP request.",
  "functions": [],
  "sourceFile": null,
  "testFile": null,
  "url": "https://cs50.harvard.edu/python/psets/4/bitcoin/"
 },
 {
  "id": "cs50p-5-test_twttr",
  "set": 5,
  "slug": "test_twttr",
  "title": "Testing my twttr",
  "filename": "test_twttr.py",
  "goal": "Build thorough pytest cases for shorten(word).",
  "functions": [
   "shorten(word)"
  ],
  "sourceFile": "twttr.py",
  "testFile": null,
  "url": "https://cs50.harvard.edu/python/psets/5/test_twttr/"
 },
 {
  "id": "cs50p-5-test_bank",
  "set": 5,
  "slug": "test_bank",
  "title": "Back to the Bank",
  "filename": "test_bank.py",
  "goal": "Write pytest cases for value(greeting).",
  "functions": [
   "value(greeting)"
  ],
  "sourceFile": "bank.py",
  "testFile": null,
  "url": "https://cs50.harvard.edu/python/psets/5/test_bank/"
 },
 {
  "id": "cs50p-5-test_plates",
  "set": 5,
  "slug": "test_plates",
  "title": "Re-requesting a Vanity Plate",
  "filename": "test_plates.py",
  "goal": "Write tests for is_valid(s) and boundary cases.",
  "functions": [
   "is_valid(s)"
  ],
  "sourceFile": "plates.py",
  "testFile": null,
  "url": "https://cs50.harvard.edu/python/psets/5/test_plates/"
 },
 {
  "id": "cs50p-5-test_fuel",
  "set": 5,
  "slug": "test_fuel",
  "title": "Refueling",
  "filename": "test_fuel.py",
  "goal": "Write tests for convert(fraction) and gauge(percentage).",
  "functions": [
   "convert(fraction)",
   "gauge(percentage)"
  ],
  "sourceFile": "fuel.py",
  "testFile": null,
  "url": "https://cs50.harvard.edu/python/psets/5/test_fuel/"
 },
 {
  "id": "cs50p-6-lines",
  "set": 6,
  "slug": "lines",
  "title": "Lines of Code",
  "filename": "lines.py",
  "goal": "Read a Python file from sys.argv and count code lines.",
  "functions": [],
  "sourceFile": null,
  "testFile": null,
  "url": "https://cs50.harvard.edu/python/psets/6/lines/"
 },
 {
  "id": "cs50p-6-pizza",
  "set": 6,
  "slug": "pizza",
  "title": "Pizza Py",
  "filename": "pizza.py",
  "goal": "Read CSV data and print a formatted table.",
  "functions": [],
  "sourceFile": null,
  "testFile": null,
  "url": "https://cs50.harvard.edu/python/psets/6/pizza/"
 },
 {
  "id": "cs50p-6-scourgify",
  "set": 6,
  "slug": "scourgify",
  "title": "Scourgify",
  "filename": "scourgify.py",
  "goal": "Transform a source CSV into a new CSV.",
  "functions": [],
  "sourceFile": null,
  "testFile": null,
  "url": "https://cs50.harvard.edu/python/psets/6/scourgify/"
 },
 {
  "id": "cs50p-6-shirt",
  "set": 6,
  "slug": "shirt",
  "title": "CS50 P-Shirt",
  "filename": "shirt.py",
  "goal": "Combine images using Pillow and file arguments.",
  "functions": [],
  "sourceFile": null,
  "testFile": null,
  "url": "https://cs50.harvard.edu/python/psets/6/shirt/"
 },
 {
  "id": "cs50p-7-numb3rs",
  "set": 7,
  "slug": "numb3rs",
  "title": "NUMB3RS",
  "filename": "numb3rs.py",
  "goal": "Write validate(ip) and tests for IPv4 inputs.",
  "functions": [
   "validate(ip)"
  ],
  "sourceFile": null,
  "testFile": "test_numb3rs.py",
  "url": "https://cs50.harvard.edu/python/psets/7/numb3rs/"
 },
 {
  "id": "cs50p-7-watch",
  "set": 7,
  "slug": "watch",
  "title": "Watch on YouTube",
  "filename": "watch.py",
  "goal": "Write parse(s) to extract a video URL from HTML.",
  "functions": [
   "parse(s)"
  ],
  "sourceFile": null,
  "testFile": null,
  "url": "https://cs50.harvard.edu/python/psets/7/watch/"
 },
 {
  "id": "cs50p-7-working",
  "set": 7,
  "slug": "working",
  "title": "Working 9 to 5",
  "filename": "working.py",
  "goal": "Write convert(s) and test time formats.",
  "functions": [
   "convert(s)"
  ],
  "sourceFile": null,
  "testFile": "test_working.py",
  "url": "https://cs50.harvard.edu/python/psets/7/working/"
 },
 {
  "id": "cs50p-7-um",
  "set": 7,
  "slug": "um",
  "title": "Regular, um, Expressions",
  "filename": "um.py",
  "goal": "Write count(s) and test word matching.",
  "functions": [
   "count(s)"
  ],
  "sourceFile": null,
  "testFile": "test_um.py",
  "url": "https://cs50.harvard.edu/python/psets/7/um/"
 },
 {
  "id": "cs50p-7-response",
  "set": 7,
  "slug": "response",
  "title": "Response Validation",
  "filename": "response.py",
  "goal": "Validate an email address with a library.",
  "functions": [],
  "sourceFile": null,
  "testFile": null,
  "url": "https://cs50.harvard.edu/python/psets/7/response/"
 },
 {
  "id": "cs50p-8-seasons",
  "set": 8,
  "slug": "seasons",
  "title": "Seasons of Love",
  "filename": "seasons.py",
  "goal": "Use dates and readable number words; write unit tests.",
  "functions": [
   "calculate_minutes(birth_date)"
  ],
  "sourceFile": null,
  "testFile": "test_seasons.py",
  "url": "https://cs50.harvard.edu/python/psets/8/seasons/"
 },
 {
  "id": "cs50p-8-jar",
  "set": 8,
  "slug": "jar",
  "title": "Cookie Jar",
  "filename": "jar.py",
  "goal": "Implement the Jar class and its required properties.",
  "functions": [
   "Jar"
  ],
  "sourceFile": null,
  "testFile": "test_jar.py",
  "url": "https://cs50.harvard.edu/python/psets/8/jar/"
 },
 {
  "id": "cs50p-8-shirtificate",
  "set": 8,
  "slug": "shirtificate",
  "title": "CS50 Shirtificate",
  "filename": "shirtificate.py",
  "goal": "Make a PDF certificate using fpdf2 and an image.",
  "functions": [],
  "sourceFile": null,
  "testFile": null,
  "url": "https://cs50.harvard.edu/python/psets/8/shirtificate/"
 }
];


 // Derived only from file names, import statements, function/class
 // signatures, and test names in the project owner's private reference.
 // No implementation logic, assertions, API tokens, or solution text is copied.
 const reference={
  '0/faces':{functions:['convert(s)'],main:true},
  '0/tip':{functions:['dollars_to_float(d)','percent_to_float(p)'],main:true},
  '1/meal':{functions:['convert(time)'],main:true},
  '2/twttr':{functions:['is_vowel(letter)'],main:true},
  '2/plates':{functions:['is_valid(s)'],main:true},
  '4/emojize':{imports:['import emoji']},
  '4/figlet':{imports:['import random','import sys','from pyfiglet import Figlet']},
  '4/adieu':{imports:['import inflect']},
  '4/game':{imports:['import random'],functions:['get_guess()','get_level()','get_number(prompt)'],main:true},
  '4/professor':{imports:['import random'],functions:['get_level()','generate_integer(level)'],main:true},
  '4/bitcoin':{imports:['import os','import requests','import sys']},
  '5/test_twttr':{functions:['shorten(word)'],main:true,testNames:['test_shorten']},
  '5/test_bank':{functions:['value(greeting)'],main:true,testNames:['test_hello','test_with_h','test_without_h']},
  '5/test_plates':{functions:['is_valid(s)'],main:true,testNames:['test_starts_with_two_letters','test_two_to_six_characters','test_numbers_at_end','test_not_allowed']},
  '5/test_fuel':{functions:['convert(fraction)','gauge(percentage)'],main:true,testNames:['test_convert','test_gauge'],testImports:['import pytest']},
  '6/lines':{imports:['import sys']},
  '6/pizza':{imports:['import csv','import sys','from tabulate import tabulate']},
  '6/scourgify':{imports:['import csv','import sys']},
  '6/shirt':{imports:['import os','import sys','from PIL import Image, ImageOps']},
  '7/numb3rs':{imports:['import re'],functions:['validate(ip)'],main:true,testNames:['test_valid','test_invalid']},
  '7/watch':{imports:['import re'],functions:['parse(s)'],main:true},
  '7/working':{imports:['import re','import sys'],functions:['convert(s)','convert_time(t)'],main:true,testNames:['test_format','test_with_minutes','test_without_minutes'],testImports:['import pytest']},
  '7/um':{imports:['import re'],functions:['count(s)'],main:true,testNames:['test_0','test_1','test_2']},
  '7/response':{imports:['import validators'],main:true},
  '8/seasons':{imports:['import inflect','import sys','from datetime import date'],functions:['calculate(t0, t1)'],main:true,testNames:['test_calculate'],testImports:['from datetime import date']},
  '8/jar':{functions:['Jar'],testNames:['test_init','test_str','test_deposit','test_withdraw'],testImports:['import pytest']},
  '8/shirtificate':{imports:['from fpdf import FPDF'],functions:['PDF.header(self)'],main:true}
 };
 const topLevelHint={
  '0/indoor':'Read input and print a lowercase version.',
  '0/playback':'Read input and replace each space with three periods.',
  '0/einstein':'Ask for mass and calculate energy with the supplied equation.',
  '1/deep':'Normalize the user input before checking acceptable answers.',
  '1/bank':'Consider conditions in order, from most to least specific.',
  '1/extensions':'Use the suffix of a normalized filename to choose a media type.',
  '1/interpreter':'Split an expression into operands and an operator.',
  '2/camel':'Iterate through the characters of a camelCase variable name.',
  '2/coke':'Repeat valid coin deposits until the purchase amount is reached.',
  '2/nutrition':'Use a mapping and handle an unknown fruit name.',
  '3/fuel':'Handle invalid fractions and zero denominators using exceptions.',
  '3/taqueria':'Continue reading item names until the input ends.',
  '3/grocery':'Count repeated entries and output sorted totals.',
  '3/outdated':'Accept both common date formats and reject invalid dates.',
  '4/emojize':'Call the emoji library on the provided text.',
  '4/figlet':'Validate command-line flags before selecting a text font.',
  '4/adieu':'Collect names until EOF and format them with inflect.',
  '4/bitcoin':'Validate command-line input and catch network errors.',
  '6/lines':'Validate the filename argument, then count source lines.',
  '6/pizza':'Validate one CSV path and use tabulate to format its records.',
  '6/scourgify':'Read a source CSV and write the transformed rows to another CSV.',
  '6/shirt':'Validate matching image extensions before composing the overlay.'
 };
 const shape=problem=>reference[problem.set+'/'+problem.slug]||{};

 const todo=message=>'    # TODO: '+message+'\n    raise NotImplementedError("Complete this problem with your own code")\n';
 function functionBlock(signature,description){
  return 'def '+signature+':\n'+todo(description)+'\n';
 }
 function mainBlock(problem){
  return functionBlock('main()',problem.set===5?'Read an input and call the required function.':problem.goal);
 }
 function buildPython(problem){
  const outline=shape(problem),signatures=outline.functions||problem.functions;
  const label='# CS50P · Problem Set '+problem.set+' · '+problem.title+'\n';
  const comment='# Assignment: '+problem.url+'\n# Original, unsolved teaching scaffold; compare against official instructions.\n\n';
  let body=(outline.imports||[]).join('\n');
  if(body)body+='\n\n\n';
  if(signatures.includes('Jar')){
   body+='class Jar:\n';
   for(const signature of ['__init__(self, capacity=12)','__str__(self)','deposit(self, cookies)','withdraw(self, cookies)']){
    body+='    def '+signature+':\n        # TODO: Implement according to the official specification.\n        raise NotImplementedError("Complete this method")\n\n';
   }
   for(const signature of ['capacity(self)','size(self)']){
    body+='    @property\n    def '+signature+':\n        # TODO: Return the required property value.\n        raise NotImplementedError("Complete this property")\n\n';
   }
   return label+comment+body;
  }
  if(problem.slug==='shirtificate'){
   body+='class PDF(FPDF):\n    def header(self):\n        # TODO: Design the header. Review the FPDF documentation.\n        raise NotImplementedError("Complete the certificate header")\n\n\n';
  }
  const wantMain=!!outline.main;
  if(wantMain)body+=mainBlock(problem);
  for(const signature of signatures){
   if(signature==='PDF.header(self)'||signature==='Jar')continue;
   body+=(wantMain||body?'\n':'')+functionBlock(signature,'Implement '+signature+' following the official problem description.');
  }
  if(wantMain)body+='\nif __name__ == "__main__":\n    main()\n';
  if(!wantMain&&signatures.filter(x=>x!=='PDF.header(self)').length===0){
   const hint=topLevelHint[problem.set+'/'+problem.slug]||problem.goal;
   body+='# TODO: '+hint+'\nraise NotImplementedError("Write your own script here")\n';
  }
  return label+comment+body;
 }
 function buildTest(filename,source,problem){
  const outline=shape(problem);
  const functions=(outline.functions||problem.functions).filter(x=>x!=='Jar'&&!x.startsWith('PDF.'));
  let imported;
  if((outline.functions||problem.functions).includes('Jar'))imported='from jar import Jar\n';
  else if(functions.length)imported='from '+source.replace(/\.py$/,'')+' import '+functions.map(x=>x.split('(')[0]).join(', ')+'\n';
  else imported='import '+source.replace(/\.py$/,'')+'\n';
  const testImports=(outline.testImports||[]).filter(line=>!imported.includes(line));
  const names=outline.testNames||['test_write_your_own_cases'];
  const stubs=names.map(name=>'def '+name+'():\n'+
   '    # TODO: Add your own meaningful assertions for this case.\n'+
   '    raise NotImplementedError("Write your own pytest assertion")\n').join('\n\n');
  return '# CS50P · '+problem.title+'\n# Assignment: '+problem.url+
   '\n# These are intentionally empty test outlines, not grading answers.\n\n'+
   [...testImports,imported.trim()].join('\n')+'\n\n\n'+stubs;
 }
 const resourceNotes={
  emojize:'Requires the emoji package; package availability on GitHub Pages may vary.',
  figlet:'Requires pyfiglet. Compare behavior with the official CS50 development environment.',
  adieu:'Requires inflect. Browser packages may not behave like a full local Python environment.',
  bitcoin:'Uses requests and a live API; network access and API response can vary.',
  pizza:'Use the original CSV resource from the official assignment; it is not bundled here.',
  scourgify:'Download the original before.csv from the official assignment; it is not bundled here.',
  shirt:'Requires Pillow and input images; original binary images are not included in this browser template.',
  shirtificate:'Requires fpdf2 and the official shirtificate.png image; binary image and PDF preview features may not work in Python Lab.',
  response:'Requires an email-validation package as directed by the official assignment.',
  seasons:'May require inflect and other packages for converting numbers into words.'
 };
 function build(problem){
  const mainFile=problem.sourceFile||problem.filename;
  const files={};
  files[mainFile]=buildPython(problem);
  if(problem.sourceFile){
   files[problem.filename]=buildTest(problem.filename,mainFile,problem);
  }else if(problem.testFile){
   files[problem.testFile]=buildTest(problem.testFile,mainFile,problem);
  }
  const notes=resourceNotes[problem.slug]||'';
  files['README.md']=[
   '# '+problem.title,
   '',
   '**CS50P Problem Set '+problem.set+': '+subjects[problem.set]+'**',
   '',
   'Official instructions: '+problem.url,
   '',
   '## Your task',
   '',
   problem.goal,
   '',
   'This starter is an original Python Lab scaffold, NOT an official CS50-distributed starter or solution.',
   'Read the full assignment before coding. The TODO blocks intentionally raise NotImplementedError until you implement them.',
   '',
   '## Getting started',
   '',
   '1. Open '+problem.filename+' in Python Lab.',
   '2. Follow the official specification, and replace TODOs with your own code.',
   problem.sourceFile||problem.testFile?'3. Open the test_*.py file and write your own meaningful assertions.':'3. Test valid and invalid inputs against the official instructions.',
   '4. Run the program or Tests panel and verify output carefully.',
   '',
   notes?'## Environment note\n\n'+notes+'\n':'',
   'check50 / submit50 and grading are only available through the official CS50-supported environment.',
   'Keep your work your own and follow CS50 academic-honesty policies.',
   ''
  ].filter(x=>x!==null).join('\n');
  return {
   id:problem.id,
   title:problem.title,
   description:problem.goal,
   set:problem.set,
   subject:subjects[problem.set],
   url:problem.url,
   slug:problem.slug,
   entryFile:problem.filename,
   sourceFile:mainFile,
   files
  };
 }
 function get(id){
  const p=catalog.find(item=>item.id===id);
  return p?build(p):null;
 }
 const list=()=>catalog.map(item=>({
  id:item.id,title:item.title,description:item.goal,
  set:item.set,subject:subjects[item.set],filename:item.filename,
  url:item.url,files:Object.keys(build(item).files)
 }));
 window.pythonLabCS50P={subjects,catalog:list,get};
})();
