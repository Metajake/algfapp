import os, datetime, math
from django.conf import settings
from django.shortcuts import render
import pandas, xlrd, numpy

def spreadsheet(request):
    prodsched = pandas.read_excel(os.path.join(settings.PROJECT_ROOT, '../files/PRODUCTION FORM.XLS'), sheetname = 0)

    data = {}

    #print(prodsched.columns[0]) #returns '2019-02-08 05:50:49.919000'
    #print(prodsched[ prodsched.columns[0] ]) #returns all rows in '2019-02-08 05:50:49.919000'
    #print(prodsched[ prodsched.columns[1] ][20]) #Returns 19th Row in 2nd column

    # Iterates through everyone row in First Column
    # for row in prodsched[ prodsched.columns[0] ]:
    #     print (row)

    # FIND DATE RANGES
    weekRanges = [[],[],[]]
    weekMarkers = []
    for index, row in enumerate(prodsched[ prodsched.columns[1] ]):
        # print(str(row).lower())
        if "monday" in str(row).lower():
            weekMarkers.append(index)

    weekRanges[0] = [weekMarkers[0] + 2, weekMarkers[1] - 1]
    weekRanges[1] = [weekMarkers[1] + 2, weekMarkers[2] - 2]
    weekRanges[2] = [weekMarkers[2] + 2, prodsched.shape[0]]

    reData = {
        'week 1': {},
        'week 2': {},
        'week 3': {},
    }

    for weekIndex in range(1,4):
        for colIndex, column in enumerate(prodsched.columns):
            reData['week '+ str(weekIndex)]['column '+ str(colIndex+1)] = []
            for rowIndex in range(weekRanges[weekIndex-1][0], weekRanges[weekIndex-1][1]):
                cellValue = prodsched[ prodsched.columns[colIndex] ][rowIndex]
                if( (type (cellValue) is float or type (cellValue) is numpy.float64) and math.isnan(cellValue) ):
                    print("Is nan")
                    cellValue = "&nbsp;"
                reData['week '+ str(weekIndex)]['column '+ str(colIndex+1)].append( cellValue )

    # print(reData)

    # Convert Spreadsheet into Dictionary
    for column in prodsched.columns:
        if isinstance(column, datetime.datetime):
            columnName = column.strftime("%m/%d/%y")
        else:
            columnName = column
        data[columnName] = []
        for row in prodsched[ column ]:
            data[columnName].append(row)

    # print (data)

    context = {
        'data' : data,
        'reData' : reData,
    }
    return render(request, 'pandaspreadsheet/spreadsheet.html', context)
