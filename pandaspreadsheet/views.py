import os, datetime, math
from django.conf import settings
from django.shortcuts import render
import pandas, xlrd, numpy

def spreadsheet(request):
    productionSpreadsheet = pandas.read_excel(os.path.join(settings.PROJECT_ROOT, '../files/PRODUCTION FORM2.XLS'), sheet_name = 0)

    #print(prodsched.columns[0]) #returns '2019-02-08 05:50:49.919000'
    #print(prodsched[ prodsched.columns[0] ]) #returns all rows in '2019-02-08 05:50:49.919000'
    #print(prodsched[ prodsched.columns[1] ][20]) #Returns 19th Row in 2nd column

    # Iterates through everyone row in First Column
    # for row in prodsched[ prodsched.columns[0] ]:
    #     print (row)

    weekRanges = constructWeekRanges(productionSpreadsheet)
    calendar = parseCalendarFromSpreadsheet(productionSpreadsheet, weekRanges)

    context = {
        'calendar' : calendar,
    }
    return render(request, 'pandaspreadsheet/spreadsheet.html', context)

def parseCalendarFromSpreadsheet(spreadsheet, weekRanges):
    calendar = {
        'week 1': {'day 1':{'items':[], 'date': ""}, 'day 2':{'items':[], 'date': ""}, 'day 3':{'items':[], 'date': ""}, 'day 4':{'items':[], 'date': ""}, 'day 5':{'items':[], 'date': ""}, 'day 6':{'items':[], 'date': ""}, 'day 7':{'items':[], 'date': ""}, },
        'week 2': {'day 1':{'items':[], 'date': ""}, 'day 2':{'items':[], 'date': ""}, 'day 3':{'items':[], 'date': ""}, 'day 4':{'items':[], 'date': ""}, 'day 5':{'items':[], 'date': ""}, 'day 6':{'items':[], 'date': ""}, 'day 7':{'items':[], 'date': ""}, },
        'week 3': {'day 1':{'items':[], 'date': ""}, 'day 2':{'items':[], 'date': ""}, 'day 3':{'items':[], 'date': ""}, 'day 4':{'items':[], 'date': ""}, 'day 5':{'items':[], 'date': ""}, 'day 6':{'items':[], 'date': ""}, 'day 7':{'items':[], 'date': ""}, },
    }

    for weekIndex in range(1,4):
        dayCount = 1
        for colIndex, column in enumerate(spreadsheet.columns):
            if dayCount >= 8:
                break
            elif colIndex % 2 == 0:
                for rowIndex in range(weekRanges[weekIndex-1][0], weekRanges[weekIndex-1][1]):
                    cellValue = spreadsheet[ spreadsheet.columns[colIndex] ][rowIndex]
                    calendar['week '+ str(weekIndex)]['day '+ str(dayCount)]['items'].append( [replaceNaN(cellValue)] )
            else:
                calendar['week '+ str(weekIndex)]['day '+str(dayCount)]['date'] = spreadsheet[ spreadsheet.columns[colIndex] ][weekRanges[weekIndex-1][0]-2]
                for rowEnumerationIndex, rowIndex in enumerate( range(weekRanges[weekIndex-1][0], weekRanges[weekIndex-1][1]) ):
                    cellValue = spreadsheet[ spreadsheet.columns[colIndex] ][rowIndex]
                    calendar['week '+ str(weekIndex)]['day '+ str(dayCount)]['items'][rowEnumerationIndex].append( replaceNaN(cellValue) )
                dayCount += 1

    return calendar

def getDictionaryFromSpreadsheet(spreadsheet):
    # Convert Spreadsheet into Dictionary
    data = {}
    for column in spreadsheet.columns:
        if isinstance(column, datetime.datetime):
            columnName = column.strftime("%m/%d/%y")
        else:
            columnName = column
        data[columnName] = []
        for row in spreadsheet[ column ]:
            data[columnName].append(row)

    return data

def constructWeekRanges(spreadsheet):
    weekRanges = [[],[],[]]
    weekMarkers = []
    for index, row in enumerate(spreadsheet[ spreadsheet.columns[1] ]):
        if "monday" in str(row).lower():
            weekMarkers.append(index)

    weekRanges[0] = [weekMarkers[0] + 2, weekMarkers[1] - 1]
    weekRanges[1] = [weekMarkers[1] + 2, weekMarkers[2] - 2]
    weekRanges[2] = [weekMarkers[2] + 2, spreadsheet.shape[0]]
    return weekRanges

def replaceNaN(cellValue):
    return "&nbsp;" if( (type (cellValue) is float or type (cellValue) is numpy.float64) and math.isnan(cellValue) ) else cellValue
