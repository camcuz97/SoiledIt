# SoiledIt
Welcome to the SoiledIt project page, created for the BudLabs hackathon 2016. The general idea is to provide a solution for farmers who want surveys of their land using drone technology, but aims to improve greatly upon the current methods by using historical land data and software. When you have information on the quality of the soil and land, combine it with precipitation data, and add a healthy dose of computing power, it becomes possible to target "problem areas" of a field. When you only have to investigate a handful of points versus blindly scanning the entire field, you can save time, energy, and most importantly, money.

## Directory structure
* app.py: The main program that runs the Flask web framework. This controls serving up the various files that the website uses.
* README.md: You're looking at it!
* data: A folder containing key data for a selected region. On release, we would pull live data from a server, or similar.
  * rawdata.csv: The raw soil condition data for a section of IL
  * custNameMuaggatt.csv: A lookup table for soil designations and their conditions
* templates: A folder with .html files for the main backbone of the website.
  * index.html: The homepage's html
* static: A folder with static files, such as .js and .css.
  * mapControl.js: Controls the Google Map API in the background
  * style.css: The style for the main website
