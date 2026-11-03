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
 const learnerGuide={
 "0/indoor": {
  "steps": [
   "Ask the user for a sentence and save the response.",
   "Find the string method that makes letters lowercase.",
   "Print the changed text without adding an explanation."
  ],
  "checks": [
   "Try mixed-case words.",
   "Make sure spaces and punctuation stay where they were."
  ],
  "setup": "speech = input(\"Say something: \")"
 },
 "0/playback": {
  "steps": [
   "Collect a sentence from the user.",
   "Replace each normal space with three periods.",
   "Print the entire transformed sentence."
  ],
  "checks": [
   "Try one word with no spaces.",
   "Try several words separated by spaces."
  ],
  "setup": "speech = input(\"Enter a sentence: \")"
 },
 "0/faces": {
  "steps": [
   "Write convert(s) to receive a string and return a changed string.",
   "Identify the two emoticon text patterns specified in the assignment.",
   "In main(), read the text, call convert, and print its result."
  ],
  "checks": [
   "Try each supported emoticon.",
   "Check a sentence containing both patterns."
  ]
 },
 "0/einstein": {
  "steps": [
   "Read a mass in kilograms and convert the input to a number.",
   "Use the energy equation from the assignment with the speed of light.",
   "Print the computed energy as a number."
  ],
  "checks": [
   "Try a small integer mass.",
   "Check the units and that you squared the correct quantity."
  ],
  "setup": "mass_text = input(\"Mass (kg): \")"
 },
 "0/tip": {
  "steps": [
   "Read the two inputs in main(): a formatted dollar amount and a percentage.",
   "Complete dollars_to_float(d) to return the numeric dollar value.",
   "Complete percent_to_float(p) to return a decimal rate.",
   "Calculate the tip and format the result as required."
  ],
  "checks": [
   "Try both whole numbers and decimals.",
   "Check the result when the percentage includes a percent sign."
  ]
 },
 "1/deep": {
  "steps": [
   "Ask the user for their proposed answer.",
   "Normalize the text so extra surrounding whitespace and capitalization do not cause a mismatch.",
   "Check the permitted numeric and written answers.",
   "Print the exact response specified in the instructions."
  ],
  "checks": [
   "Try the numeric form.",
   "Try written answers with mixed capitalization."
  ],
  "setup": "answer = input(\"What is the Answer? \")"
 },
 "1/bank": {
  "steps": [
   "Read a greeting.",
   "Normalize case and remove leading spaces.",
   "Use ordered conditions so the most specific greeting is checked first.",
   "Print the correct amount for the greeting."
  ],
  "checks": [
   "Try a greeting starting with the full special word.",
   "Try another greeting beginning with the same initial letter."
  ],
  "setup": "greeting = input(\"Greeting: \")"
 },
 "1/extensions": {
  "steps": [
   "Read a filename and ignore capitalization and surrounding spaces.",
   "Identify the filename's extension, including formats that share a MIME type.",
   "Choose the correct output for a known extension.",
   "Use the fallback output for unrecognized extensions."
  ],
  "checks": [
   "Test JPG and JPEG filenames.",
   "Try a filename with an unknown extension."
  ],
  "setup": "filename = input(\"File name: \")"
 },
 "1/interpreter": {
  "steps": [
   "Read a simple expression containing two operands and an operator.",
   "Separate it into three parts.",
   "Convert numeric pieces into numbers and perform the requested operation.",
   "Print the result in the format required by the problem."
  ],
  "checks": [
   "Try addition, subtraction, multiplication, and division.",
   "Check a result that is not a whole number."
  ],
  "setup": "expression = input(\"Expression: \")"
 },
 "1/meal": {
  "steps": [
   "In main(), ask for a time in the supported 24-hour format.",
   "Implement convert(time) so it returns a numeric hour value.",
   "Compare the resulting time with the meal ranges.",
   "Print a meal name only when the time is within a range."
  ],
  "checks": [
   "Try a time exactly at a boundary.",
   "Try a time that is between meal periods."
  ]
 },
 "2/camel": {
  "steps": [
   "Read a camelCase variable name.",
   "Look at each character in order.",
   "When you encounter an uppercase letter, prepare the correct separator and lowercase letter.",
   "Print the new snake_case name."
  ],
  "checks": [
   "Try several capital letters.",
   "Try a name that has no uppercase letters."
  ],
  "setup": "variable_name = input(\"camelCase: \")"
 },
 "2/coke": {
  "steps": [
   "Set the starting amount due from the official specification.",
   "Repeatedly show the amount still owed.",
   "Accept only the coin denominations the problem permits.",
   "Stop when the balance is paid and calculate any change."
  ],
  "checks": [
   "Try paying the exact amount.",
   "Try inserting a coin that the machine should reject."
  ],
  "setup": "amount_due = 50  # cents; read the allowed coin values in the assignment"
 },
 "2/twttr": {
  "steps": [
   "Ask the user for a word or sentence.",
   "Inspect each character to determine whether it should be omitted.",
   "Build the result from the characters you keep.",
   "Print the resulting text."
  ],
  "checks": [
   "Try mixed uppercase and lowercase vowels.",
   "Check that punctuation and digits remain unchanged."
  ]
 },
 "2/plates": {
  "steps": [
   "In main(), read a plate and call is_valid(s).",
   "Check minimum and maximum length and required starting characters.",
   "Check any digits and their allowed position.",
   "Reject punctuation or other disallowed characters."
  ],
  "checks": [
   "Test a plate at each length limit.",
   "Test a plate with a digit in an invalid position."
  ]
 },
 "2/nutrition": {
  "steps": [
   "Create a dictionary of the foods and calorie values from the assignment.",
   "Read a fruit name and normalize capitalization.",
   "Look up the value only if the item is in the dictionary.",
   "Print the required output without inventing values for unknown entries."
  ],
  "checks": [
   "Try a food that appears in the table.",
   "Try a word that is not in the table."
  ],
  "setup": "fruit = input(\"Item: \")\n# TODO: Create the calorie lookup dictionary from the official table."
 },
 "3/fuel": {
  "steps": [
   "Read a fraction written as X/Y.",
   "Validate that the pieces can be converted to integers.",
   "Handle invalid values and a zero denominator by asking again.",
   "Convert the fraction to a percentage and use the gauge formatting rules."
  ],
  "checks": [
   "Try values near empty and full.",
   "Try a denominator of zero or a malformed fraction."
  ],
  "setup": "# TODO: Build a retry loop for valid X/Y input.\n# A try/except block can handle invalid numeric conversions."
 },
 "3/taqueria": {
  "steps": [
   "Create a menu dictionary using the official listed prices.",
   "Read item names repeatedly until end-of-input.",
   "Ignore entries that are not on the menu.",
   "Keep and display a properly formatted running total."
  ],
  "checks": [
   "Try multiple items with different prices.",
   "Use end-of-input to complete the order."
  ],
  "setup": "total = 0.0\n# TODO: Add the official menu prices and an input loop."
 },
 "3/grocery": {
  "steps": [
   "Read item names until the user signals end-of-input.",
   "Normalize repeated names consistently.",
   "Count how often each item appears.",
   "Print the sorted item counts using the required formatting."
  ],
  "checks": [
   "Try the same item with different capitalization.",
   "Check that the final output is alphabetically sorted."
  ],
  "setup": "counts = {}\n# TODO: Collect items until EOF and update counts."
 },
 "3/outdated": {
  "steps": [
   "Ask for a date in either supported format.",
   "Validate the month, day, and year rather than only counting separators.",
   "Repeat the question when the input is invalid.",
   "Print a zero-padded ISO-style date."
  ],
  "checks": [
   "Try a month name and a numeric month.",
   "Try an impossible calendar date."
  ],
  "setup": "# TODO: Keep requesting a date until a valid date is entered."
 },
 "4/emojize": {
  "steps": [
   "Read the user's text.",
   "Read the official instructions for the supported emoji alias syntax.",
   "Use the emoji library to produce a changed string.",
   "Print the result."
  ],
  "checks": [
   "Try one recognized emoji code.",
   "Try ordinary text that contains no emoji codes."
  ],
  "setup": "text = input(\"Input: \")"
 },
 "4/figlet": {
  "steps": [
   "Inspect command-line arguments before using them.",
   "Handle the allowed font-option forms and invalid usage.",
   "Use pyfiglet to render the user's text.",
   "Print the rendered banner."
  ],
  "checks": [
   "Run with no command-line flag.",
   "Try a valid named font and an invalid font."
  ],
  "setup": "# TODO: Examine sys.argv and decide which font to use."
 },
 "4/adieu": {
  "steps": [
   "Collect names in a list until end-of-input.",
   "Use inflect for natural-language list formatting.",
   "Match the exact opening and punctuation requested.",
   "Print the result after input ends."
  ],
  "checks": [
   "Try one name, two names, and several names.",
   "Check the separators and final conjunction."
  ],
  "setup": "names = []\n# TODO: Keep accepting names until EOF."
 },
 "4/game": {
  "steps": [
   "In main(), choose the allowed difficulty range.",
   "Complete get_level() so it validates the player's choice.",
   "Generate a secret integer within that range.",
   "Use get_guess() to accept guesses until the correct one is entered."
  ],
  "checks": [
   "Try values outside the allowed range.",
   "Make sure incorrect guesses do not end the game."
  ]
 },
 "4/professor": {
  "steps": [
   "Ask the player to choose one of the supported levels.",
   "Complete generate_integer(level) using the range rules.",
   "Ask the required number of addition questions.",
   "Track attempts, error messages, and the final score."
  ],
  "checks": [
   "Test each permitted level.",
   "Test wrong answers and the retry limit."
  ]
 },
 "4/bitcoin": {
  "steps": [
   "Read and validate the command-line quantity.",
   "Request the pricing data from the specified endpoint.",
   "Handle invalid quantities and network or response errors.",
   "Calculate and format the resulting price."
  ],
  "checks": [
   "Try a fractional quantity.",
   "Try missing and nonnumeric arguments."
  ],
  "setup": "# TODO: Validate sys.argv, obtain the current price, and calculate the total."
 },
 "5/test_twttr": {
  "steps": [
   "Review shorten(word) in twttr.py.",
   "Choose test inputs with vowels in different positions and cases.",
   "Write pytest assertions in test_twttr.py for expected results.",
   "Run Tests and correct the implementation or tests as needed."
  ],
  "checks": [
   "Include uppercase and lowercase cases.",
   "Include text with no vowels."
  ]
 },
 "5/test_bank": {
  "steps": [
   "Review value(greeting) in bank.py.",
   "Test greetings in each category, including mixed capitalization.",
   "Write test_hello(), test_with_h(), and test_without_h().",
   "Use pytest to check both normal and boundary inputs."
  ],
  "checks": [
   "Test full greetings and shorter variations.",
   "Verify case and leading whitespace behavior."
  ]
 },
 "5/test_plates": {
  "steps": [
   "Review all validation rules for is_valid(s).",
   "Test starting letters and minimum/maximum length.",
   "Test number placement and disallowed punctuation.",
   "Add separate pytest assertions for each category."
  ],
  "checks": [
   "Cover both valid and invalid strings.",
   "Use examples exactly at the length boundaries."
  ]
 },
 "5/test_fuel": {
  "steps": [
   "Implement convert(fraction) to return a numeric percentage.",
   "Implement gauge(percentage) to format empty/full/partial states.",
   "Write pytest tests for valid fractions and expected errors.",
   "Use Tests to run both functions against boundary cases."
  ],
  "checks": [
   "Include zero denominator and invalid text.",
   "Include thresholds near empty and full."
  ]
 },
 "6/lines": {
  "steps": [
   "Validate that exactly one Python filename was supplied.",
   "Verify the file extension and handle a file that cannot be opened.",
   "Read the file and count only meaningful source-code lines.",
   "Print the final count."
  ],
  "checks": [
   "Try blank lines and comment-only lines.",
   "Test missing or extra arguments."
  ],
  "setup": "# TODO: Check sys.argv and read the selected .py file."
 },
 "6/pizza": {
  "steps": [
   "Require one CSV filename from sys.argv.",
   "Validate the argument and readable CSV input.",
   "Use csv to build a table of rows.",
   "Use tabulate and the required table format to display it."
  ],
  "checks": [
   "Try each provided menu CSV.",
   "Try a nonexistent or non-CSV filename."
  ],
  "setup": "# TODO: Validate the CSV path, read rows, then format with tabulate."
 },
 "6/scourgify": {
  "steps": [
   "Read an input CSV and output CSV from the command line.",
   "Validate the number and types of arguments.",
   "Use DictReader to access fields by column name.",
   "Separate the combined name and write the new columns with DictWriter."
  ],
  "checks": [
   "Check column headers and row count.",
   "Try invalid command-line arguments."
  ],
  "setup": "# TODO: Read with csv.DictReader and write with csv.DictWriter."
 },
 "6/shirt": {
  "steps": [
   "Read two image paths from the command line.",
   "Check the allowed extensions and ensure they match.",
   "Open the images and adjust the photo to the overlay dimensions.",
   "Overlay the shirt image and save the output safely."
  ],
  "checks": [
   "Try unsupported or mismatched extensions.",
   "Check the saved output image dimensions."
  ],
  "setup": "# TODO: Validate paths before opening or editing an image."
 },
 "7/numb3rs": {
  "steps": [
   "Write validate(ip) to examine a candidate IPv4 address.",
   "Check the expected number of dot-separated components.",
   "Validate each component's numeric format and range.",
   "Return a boolean and write pytest cases for invalid inputs."
  ],
  "checks": [
   "Test the lowest and highest allowed component values.",
   "Test missing or extra components."
  ]
 },
 "7/watch": {
  "steps": [
   "Write parse(s) to accept an HTML snippet.",
   "Locate the supported video-embed address without matching unrelated text.",
   "Extract the video identifier.",
   "Return the requested URL form or None when no match is found."
  ],
  "checks": [
   "Try a supported embed tag.",
   "Try malformed HTML and unrelated URLs."
  ]
 },
 "7/working": {
  "steps": [
   "Write convert(s) to parse the allowed 12-hour time ranges.",
   "Check format and time ranges rather than accepting any digits.",
   "Use convert_time(t) as a helper if useful.",
   "Return the requested 24-hour representation and test invalid inputs."
  ],
  "checks": [
   "Try noon and midnight.",
   "Try invalid minutes and separators."
  ]
 },
 "7/um": {
  "steps": [
   "Write count(s) to search a sentence for the standalone word.",
   "Use regular expressions with appropriate word boundaries.",
   "Ignore letter capitalization.",
   "Test when the letters appear inside another word."
  ],
  "checks": [
   "Compare standalone matches with embedded words.",
   "Try punctuation next to a match."
  ]
 },
 "7/response": {
  "steps": [
   "Read an email address from the user.",
   "Use the designated validation library.",
   "Translate the validation result into the required message.",
   "Try both valid and invalid forms."
  ],
  "checks": [
   "Try a missing domain or @ sign.",
   "Check the exact required output text."
  ],
  "setup": "# TODO: Read an email address and validate it."
 },
 "8/seasons": {
  "steps": [
   "Ask the user for a birth date in the supported format.",
   "Parse dates and compute elapsed time using date arithmetic.",
   "Use calculate(t0, t1) as a helper for the time calculation.",
   "Format the answer in words using the inflection library."
  ],
  "checks": [
   "Test a date exactly one year earlier.",
   "Try invalid date formats and future dates."
  ]
 },
 "8/jar": {
  "steps": [
   "Implement Jar.__init__ with an optional capacity.",
   "Maintain and expose the capacity and number of cookies.",
   "Implement deposit and withdraw with proper validation.",
   "Create __str__ using the requested cookie representation."
  ],
  "checks": [
   "Test negative and oversized operations.",
   "Check the string representation and both properties."
  ]
 },
 "8/shirtificate": {
  "steps": [
   "Ask for the student's name.",
   "Create a PDF document using fpdf2.",
   "Add the title, centered shirt graphic, and student name.",
   "Save a PDF with the exact required filename."
  ],
  "checks": [
   "Try both short and long names.",
   "Confirm the graphic placement in the exported PDF."
  ]
 }
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

 const indentedHint=(text,level=1)=>'    '.repeat(level)+'# TODO: '+text+'\n';
 const safeGuide=problem=>learnerGuide[problem.set+'/'+problem.slug]||{steps:[problem.goal],checks:['Compare your output with the official examples.']};
 function header(problem){
  const guide=safeGuide(problem);
  const lines=[
   '# CS50P | Problem Set '+problem.set+' | '+problem.title,
   '# Official instructions: '+problem.url,
   '# Original UNSOLVED starter - write the missing code yourself.',
   '#',
   '# YOUR MISSION',
   '# '+problem.goal,
   '#',
   '# PLAN YOUR CODE'
  ];
  guide.steps.forEach((step,i)=>lines.push('# '+(i+1)+'. '+step));
  lines.push('#','# CHECK YOUR WORK');
  guide.checks.forEach(check=>lines.push('# - '+check));
  return lines.join('\n')+'\n\n';
 }
 function functionBlock(signature,problem){
  const funcName=signature.split('(')[0];
  const guide=safeGuide(problem);
  const focus=funcName==='main'?'Gather inputs, call helpers, and print the required result.':
   'Decide what '+funcName+' should return or change; consult the official requirements.';
  const body=[
   'def '+signature+':',
   '    # TODO: '+focus,
   '    # Hint: '+guide.steps[Math.min(1,guide.steps.length-1)],
   '    pass',
   ''
  ];
  return body.join('\n')+'\n';
 }
 function buildPython(problem){
  const outline=shape(problem),signatures=outline.functions||problem.functions;
  const guide=safeGuide(problem);
  let body=(outline.imports||[]).join('\n');
  if(body)body+='\n\n\n';
  if(signatures.includes('Jar')){
   body+='class Jar:\n';
   for(const signature of ['__init__(self, capacity=12)','__str__(self)','deposit(self, cookies)','withdraw(self, cookies)']){
    const task=signature.startsWith('__init__')?'Set up the cookie count and validate the initial capacity.':
     signature.startsWith('__str__')?'Return the required cookie display.':
     signature.startsWith('deposit')?'Check the deposit amount and update the jar safely.':
     'Check the withdrawal amount before updating the jar.';
    body+='    def '+signature+':\n'+indentedHint(task,2)+'        pass\n\n';
   }
   for(const signature of ['capacity(self)','size(self)']){
    body+='    @property\n    def '+signature+':\n'+indentedHint('Return the corresponding jar value.',2)+'        pass\n\n';
   }
   return header(problem)+body;
  }
  if(problem.slug==='shirtificate'){
   body+='class PDF(FPDF):\n    def header(self):\n'+
    indentedHint('Use the PDF library to place the header; check the official layout.',2)+
    '        pass\n\n\n';
  }
  const wantMain=!!outline.main;
  if(wantMain)body+=functionBlock('main()',problem);
  for(const signature of signatures){
   if(signature==='PDF.header(self)'||signature==='Jar')continue;
   body+=(wantMain||body?'\n':'')+functionBlock(signature,problem);
  }
  if(wantMain)body+='\nif __name__ == "__main__":\n    main()\n';
  if(!wantMain&&signatures.filter(x=>x!=='PDF.header(self)').length===0){
   if(guide.setup)body+=guide.setup+'\n\n';
   body+='# TODO: '+(guide.setup?'Use the starter variable(s) above to complete the remaining steps.':(topLevelHint[problem.set+'/'+problem.slug]||problem.goal))+'\n';
   body+='# TODO: Check your work using the scenarios above.\n';
  }
  return header(problem)+body;
 }
 function buildTest(filename,source,problem){
  const outline=shape(problem);
  const functions=(outline.functions||problem.functions).filter(x=>x!=='Jar'&&!x.startsWith('PDF.'));
  let imported;
  if((outline.functions||problem.functions).includes('Jar'))imported='from jar import Jar';
  else if(functions.length)imported='from '+source.replace(/\.py$/,'')+' import '+functions.map(x=>x.split('(')[0]).join(', ');
  else imported='import '+source.replace(/\.py$/,'');
  const imports=[...new Set(['import pytest',...(outline.testImports||[]),imported])];
  const names=outline.testNames||['test_your_first_case'];
  const guide=safeGuide(problem);
  const stubs=names.map((name,i)=>[
   'def '+name+'():',
   '    # TODO: Test one specific rule or boundary from the official instructions.',
   '    # Suggestion: '+guide.checks[i%guide.checks.length],
   '    # Replace this skip with one or more real assert statements.',
   '    pytest.skip("Add your own assertions before running this test")',
   ''
  ].join('\n')).join('\n');
  return '# CS50P | '+problem.title+' | Student-written tests\n'+
   '# Official instructions: '+problem.url+'\n'+
   '# No answer keys are included. Replace each skip with your own assertions.\n\n'+
   imports.join('\n')+'\n\n\n'+stubs;
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
  const guide=safeGuide(problem);
  const hasTests=!!problem.sourceFile||!!problem.testFile;
  const steps=guide.steps.map((step,i)=>(i+1)+'. '+step);
  const checks=guide.checks.map(test=>'- '+test);
  files['README.md']=[
   '# '+problem.title,
   '',
   '**CS50P Problem Set '+problem.set+': '+subjects[problem.set]+'**',
   '',
   'Folder: '+problem.slug+' / File to open: '+problem.filename,
   '',
   'Official instructions: '+problem.url,
   '',
   '## Your mission',
   '',
   problem.goal,
   '',
   '## Step-by-step plan',
   '',
   ...steps,
   '',
   '## Check your work',
   '',
   ...checks,
   '',
   '## Using this starter in Python Lab',
   '',
   '1. Open '+problem.filename+' and read the numbered planning comments before changing the code.',
   '2. Complete each TODO in your own words and code. The functions use pass as an empty placeholder.',
   hasTests?
    '3. Write meaningful pytest assertions in the test_*.py file; remove each pytest.skip() once you add that test.':
    '3. Run the program, then compare the behavior with the examples and rules in the official instructions.',
   '4. Revise your work when it fails a self-check or test case.',
   '5. Export a ZIP backup when you want to work on another device or submit files through Canvas.',
   '',
   '## Helpful reminder',
   '',
   'The scaffold includes setup hints and structure, not a completed implementation.',
   'Always read the full Harvard CS50P problem before coding; it has the authoritative input, output, and edge-case rules.',
   'This is an original Python Lab teaching aid, NOT an official CS50-distributed starter or solution.',
   '',
   notes?'## Environment note\n\n'+notes+'\n':'',
   'Official check50 and submit50 are not part of this browser IDE; use the official CS50 environment when required.',
   'Follow the CS50 academic-honesty policy and write your own implementation.',
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
   folderName:problem.slug,
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
  set:item.set,slug:item.slug,folderName:item.slug,subject:subjects[item.set],filename:item.filename,
  url:item.url,files:Object.keys(build(item).files)
 }));
 window.pythonLabCS50P={subjects,catalog:list,get};
})();
