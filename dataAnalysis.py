# This file works on getting data from our sortedData.csv file based on a region passed in through user-set bounds on the GoogleMapsApi
import csv

# Columns
# 0 = musym, 1 = mukey, 2 = lat, 3 = long, 4 = muname, 5 = wDepAnnMin, 6 = wDepAJMin, 7 = aws25, 8 = aws50, 9 = aws100, 10 = aws150, 11 = drdc, 12 = drw

def printCol(csv):
    for row in csv:
        print row[0]

def findData(minX, maxX, minY, maxY):
    return 0

def binSearch(csv, len, minX, maxX, minY, maxY):
    mid = len/2

def assignSoilQual(row):
    return 0

def fitnessFunct(rowArray):
    tupleArray = []
    for row in rowArray:
        tempScore = findFitness(row)
        tupleArray.append((row[2],row[3],tempScore))
        print tempScore
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

with open('data/sortedDataTrunc.csv') as csvfile:
    readCSV = csv.reader(csvfile, delimiter = ',')
    i = 0
    dict = {}
    csvArray = []
    for row in readCSV:
        csvArray.append(row)

    fitnessFunct(csvArray)

    num_rows = 26256

    #binSearch(readCSV,num_rows,0,0,0,0)

    


