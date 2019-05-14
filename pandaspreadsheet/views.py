import os, datetime, math, re
from django.conf import settings
from django.shortcuts import render
from django.http import HttpResponse
import pandas, xlrd, numpy

from .models import Kettle, Product, CalendarDay

productionSpreadsheet = pandas.read_excel(settings.FORM_LOCATION+'PRODUCTION FORM.XLS', sheet_name = 0)

def test (request):
    return HttpResponse("Test Page")

def schedule(request):
    weekRanges = constructWeekRanges(productionSpreadsheet)
    calendar = parseCalendarFromSpreadsheet(productionSpreadsheet, weekRanges)
    taggedCalendar = applyViewTags(calendar)
    context = {
        'lastModified': productionSpreadsheet.columns[0],
        'calendar' : taggedCalendar,
    }
    return render(request, 'pandaspreadsheet/spreadsheet.html', context)

def today(request):
    weekRanges = constructWeekRanges(productionSpreadsheet)
    calendar = parseCalendarFromSpreadsheet(productionSpreadsheet, weekRanges)
    taggedCalendar = applyViewTags(calendar)
    scheduleDay = getTodaysScheduleFromSpreadsheet(taggedCalendar)
    multipliedScheduleDay = multiplyScheduleDay(scheduleDay)
    notedScheduleDay = applyNotesToProducts(multipliedScheduleDay)
    # cleanScheduleDay = removeEmptyCellsFromScheduleDay(notedScheduleDay)
    # print("------------PRINTING------------")

    context = {
        "scheduleDay" : scheduleDay,
    }
    return render(request, 'pandaspreadsheet/today.html', context)

def list(request, date):
    selectedKettleDate = datetime.datetime(year=datetime.date.today().year, month=datetime.date.today().month, day=int(date[-2:]))

    dateIsKettled = checkIfDateKettled(selectedKettleDate)

    if dateIsKettled == False:
        cd = CalendarDay(date = selectedKettleDate)
        cd.save()

        weekRanges = constructWeekRanges(productionSpreadsheet)
        calendar = parseCalendarFromSpreadsheet(productionSpreadsheet, weekRanges)
        taggedCalendar = applyViewTags(calendar)
        scheduleDay = getTodaysScheduleFromSpreadsheet(taggedCalendar)
        cleanScheduleDay = removeEmptyCellsFromScheduleDay(scheduleDay)
        productScheduleDay = expandProductMultiples(cleanScheduleDay)

        for product in productScheduleDay['products']:
            p = Product(item_number=product['itemNumber'], customer=product['customer'], production_date=selectedKettleDate)
            p.save()

        productScheduleDay = Product.objects.filter(production_date=selectedKettleDate)
    else:
        productScheduleDay = Product.objects.filter(production_date=selectedKettleDate)

    kettles = Kettle.objects.all()
    context = {
        "productList" : productScheduleDay,
        "kettles" : kettles,
        "dateIsKettled": dateIsKettled,
    }
    return render(request, 'pandaspreadsheet/list.html', context)

def parseCalendarFromSpreadsheet(spreadsheet, weekRanges):
    calendar = {
        'week 1': {'day 1':{'products':[], 'date': ""}, 'day 2':{'products':[], 'date': ""}, 'day 3':{'products':[], 'date': ""}, 'day 4':{'products':[], 'date': ""}, 'day 5':{'products':[], 'date': ""}, 'day 6':{'products':[], 'date': ""}, 'day 7':{'products':[], 'date': ""}, },
        'week 2': {'day 1':{'products':[], 'date': ""}, 'day 2':{'products':[], 'date': ""}, 'day 3':{'products':[], 'date': ""}, 'day 4':{'products':[], 'date': ""}, 'day 5':{'products':[], 'date': ""}, 'day 6':{'products':[], 'date': ""}, 'day 7':{'products':[], 'date': ""}, },
        'week 3': {'day 1':{'products':[], 'date': ""}, 'day 2':{'products':[], 'date': ""}, 'day 3':{'products':[], 'date': ""}, 'day 4':{'products':[], 'date': ""}, 'day 5':{'products':[], 'date': ""}, 'day 6':{'products':[], 'date': ""}, 'day 7':{'products':[], 'date': ""}, },
    }
    for weekIndex in range(1,4):
        dayCount = 1
        for colIndex, column in enumerate(spreadsheet.columns):
            if dayCount >= 8:
                break
            elif colIndex % 2 == 0:
                for rowIndex in range(weekRanges[weekIndex-1][0], weekRanges[weekIndex-1][1]):
                    cellValue = spreadsheet[ spreadsheet.columns[colIndex] ][rowIndex]
                    calendar['week '+ str(weekIndex)]['day '+ str(dayCount)]['products'].append( {'itemNumber': str(replaceNaN(cellValue)) } )
            else:
                calendar['week '+ str(weekIndex)]['day '+str(dayCount)]['date'] = str(spreadsheet[ spreadsheet.columns[colIndex] ][weekRanges[weekIndex-1][0]-2])
                for rowEnumerationIndex, rowIndex in enumerate( range(weekRanges[weekIndex-1][0], weekRanges[weekIndex-1][1]) ):
                    cellValue = spreadsheet[ spreadsheet.columns[colIndex] ][rowIndex]
                    calendar['week '+ str(weekIndex)]['day '+ str(dayCount)]['products'][rowEnumerationIndex]['customer'] = replaceNaN(cellValue)
                dayCount += 1
    return calendar

def checkIfDateKettled(selectedKettleDate):
    toReturn = False
    calendarDays = CalendarDay.objects.all()
    if len(calendarDays):
        for calendarDay in calendarDays:
            if str(calendarDay) == str(selectedKettleDate.date()):
                toReturn = True
            else:
                toReturn = False
    else:
        toReturn = False
    return toReturn

def expandProductMultiples(scheduleDay):
    multiplesToExpand = []
    multiples = []
    for index, product in enumerate(scheduleDay['products']):
        if re.search(r'x[1-9]', product['itemNumber']) and 'note' not in product['tags']:
            multiplesToExpand.append(index)
            multiples.append(product)
            quantity = int(product['itemNumber'][-1])
            itemNumber = product['itemNumber'][0:-2].strip()
    for i in reversed(multiplesToExpand):
        del scheduleDay['products'][i]

    for indexx, product in enumerate(multiples):
        quantity = int(product['itemNumber'][-1])
        itemNumber = product['itemNumber'][0:-2].strip()
        for i in range(0,quantity):
            scheduleDay['products'].append({'itemNumber':itemNumber, 'customer': product['customer'], 'tags': product['tags']})
    return scheduleDay

def applyViewTags(schedule):
    for index,week in enumerate(schedule):
        for indexx,day in enumerate(schedule[week]):
            for indexxx, product in enumerate(schedule[week][day]['products']):
                product['tags'] = []
                if product['itemNumber'].startswith('*'):
                    product['tags'].append( 'note' )
                elif product['itemNumber'] != '&nbsp;' and 'customer' in product and product['customer'] == '&nbsp;':
                    product['tags'].append( 'note' )
    return schedule

def getDictionaryFromSpreadsheet(spreadsheet):
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
    weekRanges[1] = [weekMarkers[1] + 2, weekMarkers[2] - 1]
    weekRanges[2] = [weekMarkers[2] + 2, spreadsheet.shape[0]]
    return weekRanges

def getTodaysScheduleFromSpreadsheet(calendar):
    scheduleDay = None
    todaysDate = datetime.datetime.today().day
    for index, week in enumerate(calendar):
        for index, day in enumerate(calendar[week]):
            dateString = calendar[week][day]['date'].strip()
            dateNumber = dateString[-2:].strip()
            if dateNumber.startswith('0'):
                dateNumber = dateNumber[1:]
            if dateNumber == str(todaysDate):
                scheduleDay = calendar[week][day]
    if scheduleDay is None:
        return {"products":[],"date":"error"}
    else:
        return scheduleDay

def multiplyScheduleDay(scheduleDay):
    toReturn = scheduleDay
    multiples = []
    for index, product in enumerate(toReturn['products']):
        toReturn['products'][index]['multiple'] = 0
        if product['itemNumber'].strip()[-2:][0] == 'x':
            multiplyAmount = int(product['itemNumber'].strip()[-2:][1])
            productStringSansMultiplyAmount = product['itemNumber'].strip()[0:-2].strip()
            toReturn['products'][index]['itemNumber'] = productStringSansMultiplyAmount

            multiples.append({'index': index, 'multiplyAmount': multiplyAmount})

    for i, m in enumerate( multiples[::-1] ):
        toReturn['products'][m['index']]['multiple'] = m['multiplyAmount']
        for k in range( m['multiplyAmount'] ):
            newMultiple = m['multiplyAmount'] - k
            toInsert = toReturn['products'][m['index']].copy()
            toInsert['multiple'] = newMultiple
            toReturn['products'].insert(m['index'], toInsert)

        del toReturn['products'][m['index'] + m['multiplyAmount']]

    return toReturn

def removeEmptyCellsFromScheduleDay(scheduleDay):
    emptyProductsToRemove = []
    for index, product in enumerate(scheduleDay['products']):
        if(product['itemNumber'] == '&nbsp;'):
            emptyProductsToRemove.append(index)
    for i in reversed(emptyProductsToRemove):
        del scheduleDay['products'][i]
    return scheduleDay

def applyNotesToProducts(scheduleDay):
    for index, product in enumerate( scheduleDay['products'] ):
        product['note'] = ""
        if 'note' in product['tags']:
            note = product['itemNumber']
            step = 0
            while scheduleDay['products'][index - step]['itemNumber'] != '&nbsp;':
                scheduleDay['products'][index-step]['note'] = note
                step += 1
    for index, product in enumerate(scheduleDay['products']):
        if product['itemNumber'].startswith('*'):
            del scheduleDay['products'][index]
    return scheduleDay

def replaceNaN(cellValue):
    return "&nbsp;" if( (type (cellValue) is float or type (cellValue) is numpy.float64) and math.isnan(cellValue) ) else cellValue
