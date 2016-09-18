import csv
import json
from flask import Flask, render_template, request
app = Flask(__name__)

#An analysis class reference - this holds the data!
csvfile = None
readCSV = None

try:
    csvfile = open('data/sortedDataTrunc.csv')
    readCSV = csv.reader(csvfile, delimiter = ',')
except:
    readCSV = None

def printCol(csv):
    for row in csv:
        print row[0]

def findData(minX, maxX, minY, maxY):
    print "findData called!"
    minLat = abs(minX)
    maxLat = abs(maxX)

    if abs(minX) > abs(maxX):
        minLat = abs(maxX)
        maxLat = abs(minX)

    minLng = abs(minY)
    maxLng = abs(maxY)

    if abs(minY) > abs(maxY):
        minLng = abs(maxY)
        maxLng = abs(minY)

    rowArray = []
    global readCSV
    global csvfile
    if readCSV == None:
        print "readCSV was None- returning from findData"
    else:
        count = 0
        for row in readCSV:
            count += 1
            #print "X:" + str(float(row[2])) + " Y:" + str(float(row[3]))
            #print "minX:" + minLat + " maxX: " + maxLat + " minY " + minLng + " maxY " + maxLng
            if abs(float(row[2])) >= minLat and abs(float(row[2])) <= maxLat and abs(float(row[3])) >= minLng and abs(float(row[3])) <= maxLng:
                rowArray.append(row)
        csvfile.seek(0)
        #print "Number of rows read: " + str(count)
        return fitnessFunct(rowArray)

def binSearch(csv, len, minX, maxX, minY, maxY):
    mid = len/2

def fitnessFunct(rowArray):
    tupleArray = []
    for row in rowArray:
        tempScore = findFitness(row)
        tupleArray.append((row[2],row[3],tempScore))
    return tupleArray

def findFitness(row):
    score = 0
    #first checks drainage (most important)
    if row[11] == 'Well drained':
        score += 15
    elif row[11] == 'Moderately well drained':
        score += 8
    elif row[11] == 'Somewhat poorly drained':
        score += 4
    elif row[11] == 'Poorly drained':
        score += 2
    elif row[11] == 'Very poorly drained':
        score += 1
    #next checks soil's ability to store water
    if row[7] <= 3.2:
        score += 4
    elif row[7] <= 4.6:
        score += 6
    elif row[7] <= 5.3:
        score += 3
    elif row[7] <= 5.93:
        score += 1
    #lastly checks water depth minimum
    if row[5] >= 120:
        score += 2
    elif row[5] >= 80:
        score += 4
    elif row[5] >= 60:
        score += 6
    elif row[5] >= 40:
        score += 3
    else:
        score +=1

    return float(score)/27.0

#end data analysis methods

#general- main page
@app.route('/index')
@app.route('/')
def hello_world():
	return render_template('index.html')

#when we have selected an area
@app.route('/select', methods=['GET', 'POST'])
def selector():
	minlat = float(request.args.get('minlat'))
	minlng = float(request.args.get('minlng'))
	maxlat = float(request.args.get('maxlat'))
	maxlng = float(request.args.get('maxlng'))

	points = findData(minlat, maxlat, minlng, maxlng)
	return json.dumps(points)

    #return "Hi! Got data: " + str(minlat)
	#return "x1:"+str(minlat)+"y1:"+str(minlng)+"x2:"+str(maxlat)+"y2"+str(maxlng)
	#return str(points[0])

if __name__ == "__main__":
	app.run(host="0.0.0.0", debug=True)
