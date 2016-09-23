# SoiledIt
![Image1](https://github.com/camcuz97/SoiledIt/blob/master/Server-Website/github_image1.png "Example of website usage")

Welcome to the SoiledIt project page, created for the BudLabs hackathon 2016. The general idea is to provide a solution for farmers who want surveys of their land using drone technology, but aims to improve greatly upon the current methods by using historical land data and software. When you have information on the quality of the soil and land, combine it with precipitation data, and add a healthy dose of computing power, it becomes possible to target "problem areas" of a field. When you only have to investigate a handful of points versus blindly scanning the entire field, you can save time, energy, and most importantly, money.

## Directory structure
* README.md: You're looking at it! This is a summary of most everything we did.
* Drone: All of the code related to creating and flying a mockup of a drone.
  * new_ping.ino: The main Arduino program for the drone. The drone, by the end of the build period, has the (limited) capabilities to fly, and the fully fledged camera/voice/sensor addons installed.
* Server-Website: All of the code related to the server backend, and the website frontend. We used Flask to serve up pages and deal with traffic, and Javascript scripts to actually display the cool data.
  * data: A folder containing key data for a selected region. On release, we would pull live data from a server, or similar; right now it's as simple as importing a different set of data, pre-processing it, and replacing "sortedDataTrunc.csv".
    * custNameMuaggat.csv: A lookup table for soil designations and their conditions.
    * rawdata.csv: The raw soil condition data for a section of IL (specifically, Champaign county).
    * sortedData.csv: The entire data set (with additional X and Y coordinates), sorted first by X and then by Y.
    * sortedDataTrunc.csv: As sortedData.csv, but with all non-utilized data columns removed to save on memory.
  * pythonSorter: A small script that generated the sorteddata files
    * rawdata.csv: A copy of the raw data for testing
    * sorter.py: A small script that generates the sorteddata files
  * static: Where all of the Flask static files are stored
    * assets: Contains all of the images we used in the website
      * (several image files, you get the picture)
    * mapControl.js: The main frontend file. If you want to see how the Google Maps API was incorporated, or how we drew the data, check here.
    * style.css: The main style class that makes the website pretty.
  * templates: The Flask dynamic files. We kept our .html files here.
    * about.html: The about page. Check us out!
    * index.html: The main page. You'll see this first!
  * app.py: The Flask main file. This is where the server handles all the data and incoming requests.

## How to run
Server: To spin up the server, make sure you have Python and Flask installed. Navigate into the folder that contains "app.py", and run "python app.py"
