from django.shortcuts import render, render_to_response
from django.http import Http404

from datetime import date, timedelta
import pandas, xlrd, numpy
from dateutil import parser
from pandaspreadsheet.views import productionSpreadsheet, constructWeekRanges, parseCalendarFromSpreadsheet, applyViewTags, getTodaysScheduleFromSpreadsheet, getTodaysScheduleFromSpreadsheet, removeEmptyCellsFromScheduleDay, replaceNaN, multiplyScheduleDay

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

def today(request):
    today = date.today()

    #Create a New Production Day, if it does not already exist
    try:
        todaysProductionDay = ProductionDay.objects.get(date=today)
    except ProductionDay.DoesNotExist:
        todaysProductionDay = ProductionDay(date=today)
        todaysProductionDay.save()

    kettle_numbers = ['K1', 'K2', 'K3', 'K4', 'L5', 'T6', 'K7', 'K8', 'T9']
    for i in kettle_numbers:
        try:
            k = Kettle.objects.get(kettle_number = i, production_date = todaysProductionDay)
        except Kettle.DoesNotExist:
            k = Kettle(kettle_number = i, production_date = todaysProductionDay)
            k.save()

    todaysProducts = createTodaysProductList()
    if todaysProducts['date'] == "error":
        notification = "There is a conflict between the app and the Production Schedule, having to do with the DATE.\n"
    else:
        notification = ""

    for index, product in enumerate(todaysProducts['products']):
        try:
            #Look Up Product Gluten, USDA, Name from BaseProduct Model
            p = Product.objects.get(item_number = product['itemNumber'], production_date = todaysProductionDay, multiple = product['multiple'])
        except Product.DoesNotExist:
            #Look Up Product Gluten, USDA, Name from BaseProduct Model
            p = Product(item_number = product['itemNumber'], production_date = todaysProductionDay, tags=[''], multiple = product['multiple'])
            p.save()
    context = {
        'todays_date' : today,
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

def createTodaysProductList():
    weekRanges = constructWeekRanges(productionSpreadsheet)
    calendar = parseCalendarFromSpreadsheet(productionSpreadsheet, weekRanges)
    taggedCalendar = applyViewTags(calendar)
    scheduleDay = getTodaysScheduleFromSpreadsheet(taggedCalendar)
    multipliedScheduleDay = multiplyScheduleDay(scheduleDay)
    strippedScheduleDay = removeEmptyCellsFromScheduleDay(multipliedScheduleDay)
    return strippedScheduleDay
