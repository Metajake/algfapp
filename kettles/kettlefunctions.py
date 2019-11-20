from datetime import date, timedelta

from pandaspreadsheet.views import *

from products.models import Product as BaseProduct
from .models import ProductionDay, Kettle, Product

def getNextMonday():
    nextMonday = None
    if date.today().weekday() >= 2:
        nextMonday = date.today() + timedelta(days= (7 - date.today().weekday()))
    return nextMonday

def createTodaysProductList(dayToSchedule, spreadsheetToParse):
    weekRanges = constructWeekRanges(spreadsheetToParse)
    calendar = parseCalendarFromSpreadsheet(spreadsheetToParse, weekRanges)
    taggedCalendar = applyNoteTags(calendar)
    scheduleDay = getTodaysScheduleFromSpreadsheet(taggedCalendar, dayToSchedule)
    multipliedScheduleDay = multiplyScheduleDay(scheduleDay)
    notedScheduleDay = applyNotesToProducts(multipliedScheduleDay)
    tucsLessScheduleDay = removeTucsFromScheduleNumbers(notedScheduleDay)
    convertedScheduleDay = convertScheduleNumbersToItemNumbers(tucsLessScheduleDay)
    strippedScheduleDay = removeEmptyCellsFromScheduleDay(convertedScheduleDay)
    return strippedScheduleDay

def checkAndCreateProducts(production_day, days_products):
    for index, product in enumerate(days_products['products']):
        try:
            p = Product.objects.get(schedule_number = product['scheduleNumber'], production_date = production_day, multiple = product['multiple'])
        except Product.DoesNotExist:
            try:
                bp = BaseProduct.objects.get(item_number = product['itemNumber'])
            except BaseProduct.DoesNotExist:
                p = Product(schedule_number = product['scheduleNumber'], item_number = product['itemNumber'], production_date = production_day, tags=[''], multiple = product['multiple'], note = product['note'], kettle_order = index)
                p.save()
            else:
                p = Product(schedule_number = product['scheduleNumber'], item_number = product['itemNumber'], product_name = bp.product_name, gluten_free = bp.gluten_free, production_date = production_day, tags=[''], multiple = product['multiple'], note = product['note'], kettle_order = index)
                p.save()

def checkAndCreateProductionDay(the_date):
    try:
        todaysProductionDay = ProductionDay.objects.get(date=the_date)
    except ProductionDay.DoesNotExist:
        todaysProductionDay = ProductionDay(date=the_date)
        todaysProductionDay.save()

    return todaysProductionDay

def checkAndCreateKettles(productionDayToKettle):
    kettle_numbers = ['K-1', 'K-2', 'K-3', 'K-4', 'K-6', 'K-7', 'TK-1', 'TK-2']

    if productionDayToKettle.has_kettle() == False:
        for i in kettle_numbers:
            try:
                k = Kettle.objects.get(kettle_number = i, production_date = productionDayToKettle)
            except Kettle.DoesNotExist:
                k = Kettle(kettle_number = i, production_date = productionDayToKettle)
                k.save()


def getDatesWithProductCounts(calendarToParse):
    daysWithProducts = []
    for week in calendarToParse:
        for day in calendarToParse[week]:
            if len(calendarToParse[week][day]['products']):
                daysWithProducts.append(calendarToParse[week][day]['date'][-2:].strip())
    return daysWithProducts
