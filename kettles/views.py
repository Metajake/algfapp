from django.shortcuts import render, render_to_response
from django.http import Http404

from datetime import date, timedelta
import pandas, xlrd, numpy
from dateutil import parser
from pandaspreadsheet.views import productionSpreadsheet, constructWeekRanges, parseCalendarFromSpreadsheet, applyViewTags, getTodaysScheduleFromSpreadsheet, getTodaysScheduleFromSpreadsheet, removeEmptyCellsFromScheduleDay, replaceNaN, multiplyScheduleDay, applyNotesToProducts, convertScheduleNumbersToItemNumbers

from products.models import Product as BaseProduct
from .models import ProductionDay, Kettle, Product

def this_week(request):
    firstDayOfWeek = date.today() - timedelta(days=3)
    today = date.today()
    lastDayOfWeek = date.today() + timedelta(days=3)
    context = {
        'firstDay' : firstDayOfWeek,
        'today' : today,
        'lastDay' : lastDayOfWeek,
    }
    return render(request, 'kettles/this_week.html', context)

def assignment_days(request):
    assignment_days = ProductionDay.objects.all()
    #eventually return the past 7 days. To get older days you gotta click and "archive" link
    context = {
        'days' : assignment_days,
    }
    return render(request, 'kettles/assignment_days.html', context)

def assignment_date(request, date_to_assign):
    theDate = parser.parse(date_to_assign).strftime('%Y-%m-%d')

    todaysProductionDay = checkAndCreateProductionDay(theDate)

    checkAndCreateKettles(todaysProductionDay)

    todaysProducts = createTodaysProductList()

    notification = checkForDateNotification(todaysProducts)

    checkAndCreateProducts(todaysProductionDay, todaysProducts)

    context = {
        'production_day' : todaysProductionDay,
        'todays_products': todaysProductionDay.days_products.all().order_by('creation_date'),
        'notification' : notification,
    }
    return render(request, 'kettles/assignment_date.html', context)

def today(request):

    todaysProductionDay = checkAndCreateProductionDay(date.today())

    checkAndCreateKettles(todaysProductionDay)

    todaysProducts = createTodaysProductList()

    notification = checkForDateNotification(todaysProducts)

    for index, product in enumerate(todaysProducts['products']):
        try:
            p = Product.objects.get(schedule_number = product['scheduleNumber'], production_date = todaysProductionDay, multiple = product['multiple'])
        except Product.DoesNotExist:
            try:
                bp = BaseProduct.objects.get(item_number = product['itemNumber'])
            except BaseProduct.DoesNotExist:
                p = Product(schedule_number = product['scheduleNumber'], item_number = product['itemNumber'], production_date = todaysProductionDay, tags=[''], multiple = product['multiple'], note = product['note'])
                p.save()
            else:
                p = Product(schedule_number = product['scheduleNumber'], item_number = product['itemNumber'], product_name = bp.product_name, gluten_free = bp.gluten_free, production_date = todaysProductionDay, tags=[''], multiple = product['multiple'], note = product['note'])
                p.save()
    context = {
        'todays_date' : date.today(),
        'production_day' : todaysProductionDay,
        'todays_products': todaysProductionDay.days_products.all().order_by('creation_date'),
        'notification' : notification,
    }
    return render(request, 'kettles/today.html', context)

def list(request):
    productionDays = ProductionDay.objects.all()
    context = {
        'production_days' : productionDays,
    }
    return render(request, 'kettles/list.html', context)

def list_day(request, list_date):
    formattedDate = parser.parse(list_date).strftime('%Y-%m-%d')
    productionDay = ProductionDay.objects.get(date=formattedDate)
    context = {
        'production_day' : productionDay,
    }
    return render(request, 'kettles/day.html', context)

def update_kettle(request):
    pd = ProductionDay.objects.get(date=request.GET['date'])
    kettle = Kettle.objects.get(production_date=pd, kettle_number=request.GET['kettle'])
    return render_to_response('kettles/update_kettle.html', {'kettle': kettle})

def update_production_list(request):
    pd = ProductionDay.objects.get(date=request.GET['date'])
    context = {
        "production_day" : pd,
        "todays_products" : pd.days_products.all().order_by('creation_date'),
    }
    return render_to_response('kettles/update_production_list.html', context)

def update_list_day(request, list_date):
    pd = ProductionDay.objects.get(date=request.GET['date'])
    return render_to_response('kettles/update_list_day.html', {'production_day': pd})

def testchannels(request):
    context = {
    'message' : "yoyo",
    }
    return render(request, 'kettles/edit.html', context)

def checkAndCreateProductionDay(the_date):
    try:
        todaysProductionDay = ProductionDay.objects.get(date=the_date)
    except ProductionDay.DoesNotExist:
        todaysProductionDay = ProductionDay(date=the_date)
        todaysProductionDay.save()

    return todaysProductionDay

def checkAndCreateKettles(the_date):
    kettle_numbers = ['K1', 'K2', 'K3', 'K4', 'L5', 'T6', 'K7', 'K8', 'T9']
    for i in kettle_numbers:
        try:
            k = Kettle.objects.get(kettle_number = i, production_date = the_date)
        except Kettle.DoesNotExist:
            k = Kettle(kettle_number = i, production_date = the_date)
            k.save()

def checkAndCreateProducts(production_day, days_products):
    for index, product in enumerate(days_products['products']):
        try:
            p = Product.objects.get(schedule_number = product['scheduleNumber'], production_date = production_day, multiple = product['multiple'])
        except Product.DoesNotExist:
            try:
                bp = BaseProduct.objects.get(item_number = product['itemNumber'])
            except BaseProduct.DoesNotExist:
                p = Product(schedule_number = product['scheduleNumber'], item_number = product['itemNumber'], production_date = production_day, tags=[''], multiple = product['multiple'], note = product['note'])
                p.save()
            else:
                p = Product(schedule_number = product['scheduleNumber'], item_number = product['itemNumber'], product_name = bp.product_name, gluten_free = bp.gluten_free, production_date = production_day, tags=[''], multiple = product['multiple'], note = product['note'])
                p.save()

def checkForDateNotification(days_products):
    if days_products['date'] == "error":
        notification = "There is a conflict between the app and the Production Schedule, having to do with the DATE.\n"
    else:
        notification = ""

    return notification

def createTodaysProductList():
    weekRanges = constructWeekRanges(productionSpreadsheet)
    calendar = parseCalendarFromSpreadsheet(productionSpreadsheet, weekRanges)
    taggedCalendar = applyViewTags(calendar)
    scheduleDay = getTodaysScheduleFromSpreadsheet(taggedCalendar)
    multipliedScheduleDay = multiplyScheduleDay(scheduleDay)
    notedScheduleDay = applyNotesToProducts(multipliedScheduleDay)
    convertedScheduleDay = convertScheduleNumbersToItemNumbers(notedScheduleDay)
    strippedScheduleDay = removeEmptyCellsFromScheduleDay(convertedScheduleDay)
    return strippedScheduleDay
