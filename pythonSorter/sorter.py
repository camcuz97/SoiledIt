import csv
import operator

def sortcsvbymanyfields(csvfilename, themanyfieldscolumnnumbers):
  with open(csvfilename, 'rb') as f:
    readit = csv.reader(f)
    thedata = list(readit)
  thedata.sort(key=operator.itemgetter(*themanyfieldscolumnnumbers))
  with open(csvfilename, 'wb') as f:
    writeit = csv.writer(f)
    writeit.writerows(thedata)

sortcsvbymanyfields('rawdata.csv', [4,5])
print 'written'
