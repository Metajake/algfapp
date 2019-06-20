from django.conf import settings
from django.shortcuts import render
from django.http import HttpResponse

import os, datetime, math, re
import pandas, xlrd, numpy

from pandaspreadsheet.exceptions import BusinessLogicException
from .models import Kettle, Product, CalendarDay

def test (request):
    return HttpResponse("Test Page")

def schedule(request):
    productionSpreadsheet = readSpreadsheet()
    weekRanges = constructWeekRanges(productionSpreadsheet)
    calendar = parseCalendarFromSpreadsheet(productionSpreadsheet, weekRanges)
    taggedCalendar = applyNoteTags(calendar)
    context = {
        'lastModified': productionSpreadsheet.columns[0],
        'calendar' : taggedCalendar,
    }
    return render(request, 'pandaspreadsheet/spreadsheet.html', context)

def today(request):
    productionSpreadsheet = readSpreadsheet()
    weekRanges = constructWeekRanges(productionSpreadsheet)
    calendar = parseCalendarFromSpreadsheet(productionSpreadsheet, weekRanges)
    taggedCalendar = applyNoteTags(calendar)
    scheduleDay = getTodaysScheduleFromSpreadsheet(taggedCalendar, str(datetime.datetime.today().day) )
    multipliedScheduleDay = multiplyScheduleDay(scheduleDay)
    notedScheduleDay = applyNotesToProducts(multipliedScheduleDay)
    tucsLessScheduleDay = removeTucsFromScheduleNumbers(notedScheduleDay)
    convertedScheduleDay = convertScheduleNumbersToItemNumbers(tucsLessScheduleDay)
    cleanScheduleDay = removeEmptyCellsFromScheduleDay(convertedScheduleDay)

    # print("------------PRINTING------------")

    context = {
        "scheduleDay" : scheduleDay,
    }
    return render(request, 'pandaspreadsheet/today.html', context)

def list(request, date):
    productionSpreadsheet = readSpreadsheet()
    selectedKettleDate = datetime.datetime(year=datetime.date.today().year, month=datetime.date.today().month, day=int(date[-2:]))

    dateIsKettled = checkIfDateKettled(selectedKettleDate)

    if dateIsKettled == False:
        cd = CalendarDay(date = selectedKettleDate)
        cd.save()

        weekRanges = constructWeekRanges(productionSpreadsheet)
        calendar = parseCalendarFromSpreadsheet(productionSpreadsheet, weekRanges)
        taggedCalendar = applyNoteTags(calendar)
        scheduleDay = getTodaysScheduleFromSpreadsheet(taggedCalendar, datetime.datetime.today().day)
        cleanScheduleDay = removeEmptyCellsFromScheduleDay(scheduleDay)
        productScheduleDay = expandProductMultiples(cleanScheduleDay)

        for product in productScheduleDay['products']:
            p = Product(item_number=product['scheduleNumber'], customer=product['customer'], production_date=selectedKettleDate)
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

def getThisWeeksParsedNotedProductionSchedule(scheduleToParse, dateToParseFrom):
    parsedCalendar = getTaggedCalendar(scheduleToParse)
    thisWeeksSchedule = getThisWeeksProductionSchedule(parsedCalendar, dateToParseFrom)
    productionWeek = getThisWeeksScheduleDays(thisWeeksSchedule)
    return applyNotesToProductionWeek(productionWeek)

def readSpreadsheet():
    try:
        toReturn = pandas.read_excel(settings.FORM_LOCATION+'PRODUCTION FORM.xls', sheet_name = 0)
    except:
        raise BusinessLogicException("ERROR READING PRODUCTION SCHEDULE (Excel Spreadsheet). Please Consult Site Admin.")
    return toReturn

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
                    calendar['week '+ str(weekIndex)]['day '+ str(dayCount)]['products'].append( {'scheduleNumber': str(replaceNaN(cellValue)) } )
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
        if re.search(r'x[1-9]', product['scheduleNumber']) and 'note' not in product['tags']:
            multiplesToExpand.append(index)
            multiples.append(product)
            quantity = int(product['scheduleNumber'][-1])
            scheduleNumber = product['scheduleNumber'][0:-2].strip()
    for i in reversed(multiplesToExpand):
        del scheduleDay['products'][i]

    for indexx, product in enumerate(multiples):
        quantity = int(product['scheduleNumber'][-1])
        scheduleNumber = product['scheduleNumber'][0:-2].strip()
        for i in range(0,quantity):
            scheduleDay['products'].append({'scheduleNumber':scheduleNumber, 'customer': product['customer'], 'tags': product['tags']})
    return scheduleDay

def applyNoteTags(schedule):
    for index,week in enumerate(schedule):
        for indexx,day in enumerate(schedule[week]):
            for indexxx, product in enumerate(schedule[week][day]['products']):
                product['tags'] = []
                if product['scheduleNumber'].startswith('*'):
                    product['tags'].append( 'note' )
                elif product['scheduleNumber'] != '&nbsp;' and 'customer' in product and product['customer'] == '&nbsp;':
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

def getTodaysScheduleFromSpreadsheet(calendar, dayToSchedule):
    scheduleDay = None
    todaysDate = dayToSchedule
    if todaysDate.startswith('0'):
        todaysDate = todaysDate[1:]
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

#TODO Refactor this function into separate parts
def multiplyScheduleDay(scheduleDay):
    toReturn = scheduleDay
    multiples = []
    for index, product in enumerate(toReturn['products']):
        toReturn['products'][index]['multiple'] = 0
        scheduleNumber = product['scheduleNumber']

        toSearchFor = re.compile('x|X')
        productHasMultiple = toSearchFor.search(scheduleNumber)

        if productHasMultiple:
            multiplierPosition = productHasMultiple.start()
            multiplyAmount = float( scheduleNumber[multiplierPosition+1:])
            productStringSansMultiplyAmount = scheduleNumber[0:multiplierPosition].strip()
            toReturn['products'][index]['scheduleNumber'] = productStringSansMultiplyAmount

            multiples.append({'index': index, 'multiplyAmount': multiplyAmount})

    for i, m in enumerate( multiples[::-1] ):
        originalMultiplyAmount = int( math.ceil(m['multiplyAmount']) )
        toReturn['products'][m['index']]['multiple'] = m['multiplyAmount']

        while m['multiplyAmount'] > 0.0:
            toInsert = toReturn['products'][m['index']].copy()
            if m['multiplyAmount'] >= 1.0:
                newMultiple = int( m['multiplyAmount'] )
            else:
                newMultiple = m['multiplyAmount']
            toInsert['multiple'] = newMultiple
            toReturn['products'].insert(m['index'], toInsert)
            m['multiplyAmount'] -= 1.0

        del toReturn['products'][m['index'] + originalMultiplyAmount]

    return toReturn

def applyNotesToProducts(scheduleDay):
    # print(scheduleDay)
    for index, product in enumerate( scheduleDay['products'] ):
        product['note'] = ""
        if 'note' in product['tags'] and product['scheduleNumber'].startswith('*'):
            note = product['scheduleNumber']
            step = 0
            while scheduleDay['products'][index - step]['scheduleNumber'] != '&nbsp;':
                scheduleDay['products'][index-step]['note'] = note
                step += 1
        if product['customer'].lower().startswith('goes '):
            product['tags'].append('note')
            product['note'] = product['customer'].lower()
    for index, product in enumerate(scheduleDay['products']):
        if product['scheduleNumber'].startswith('*'):
            del scheduleDay['products'][index]
    return scheduleDay

def removeTucsFromScheduleNumbers(scheduleDay):
    for product in scheduleDay['products']:
        if product['scheduleNumber'].startswith('TUC'):
            product['scheduleNumber'] = product['scheduleNumber'].split(' ',1)[1]
    return scheduleDay

def convertScheduleNumbersToItemNumbers(scheduleDay):
    for index, product in enumerate(scheduleDay['products']):
        itemNumber = re.findall('\d+', product['scheduleNumber'] )
        if len(itemNumber):
            product['itemNumber'] = itemNumber[0]
        else:
            product['itemNumber'] = ''
    return scheduleDay

def removeEmptyCellsFromScheduleDay(scheduleDay):
    emptyProductsToRemove = []
    for index, product in enumerate(scheduleDay['products']):
        if(product['scheduleNumber'] == '&nbsp;'):
            emptyProductsToRemove.append(index)
    for i in reversed(emptyProductsToRemove):
        del scheduleDay['products'][i]
    return scheduleDay

def removeEmptyCellsFromProductionSchedule(calendarToClean):
    for week in calendarToClean:
        emptyDaysToRemove = []
        for day in calendarToClean[week]:
            calendarToClean[week][day] = removeEmptyCellsFromScheduleDay(calendarToClean[week][day])
            if calendarToClean[week][day]['date'] == '':
                emptyDaysToRemove.append(day)
        for dayToRemove in emptyDaysToRemove:
            del calendarToClean[week][dayToRemove]
    return calendarToClean

def applyNotesToProductionWeek(weekToNote):
    for index, day in enumerate(weekToNote):
        weekToNote[index] = applyNotesToProducts(weekToNote[index])
        #Future: Check Item Numbers against Base Products for Gluten Free Notes...
        # productionWeek[index] = convertScheduleNumbersToItemNumbers(productionWeek[index])
    return weekToNote

def getThisWeeksScheduleDays(weekSchedule):
    scheduledProductionSheetDays = []
    for day in weekSchedule:
        if re.match('(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)', weekSchedule[day]['date']) is not None:
            scheduledProductionSheetDays.append(weekSchedule[day])
    return scheduledProductionSheetDays

def getThisWeeksProductionSchedule(fullProductionSchedule, todaysDate):
    thisWeek = {}
    todaysDate = str( int(todaysDate) ) #If todaysDate starts with 0, convert to int, then convert back to string
    for weekIndex, week in enumerate(fullProductionSchedule):
        for dayIndex, day in enumerate(fullProductionSchedule[week]):
            dayDate = fullProductionSchedule[week][day]['date'][-2:].strip()
            if todaysDate == dayDate:
                thisWeek = fullProductionSchedule[week]
    return thisWeek

def checkForDateNotification(days_products):
    if days_products['date'] == "error":
        notification = "There is a conflict between the app and the Production Schedule, having to do with the DATE.\n"
    else:
        notification = ""

    return notification

def getTaggedCalendar(sheetToTag):
    weekRanges = constructWeekRanges(sheetToTag)
    calendar = parseCalendarFromSpreadsheet(sheetToTag, weekRanges)
    taggedCalendar = applyNoteTags(calendar)
    return taggedCalendar

def replaceNaN(cellValue):
    return "&nbsp;" if( (type (cellValue) is float or type (cellValue) is numpy.float64) and math.isnan(cellValue) ) else cellValue
