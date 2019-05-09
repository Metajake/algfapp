from django.shortcuts import render
from django.http import Http404

from datetime import date, timedelta
import pandas, xlrd, numpy
from dateutil import parser
from pandaspreadsheet.views import productionSpreadsheet, constructWeekRanges, parseCalendarFromSpreadsheet, applyViewTags, getTodaysScheduleFromSpreadsheet, getTodaysScheduleFromSpreadsheet, removeEmptyCellsFromScheduleDay, replaceNaN

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
            k = Kettle(kettle_number = i, production_date = todaysProductionDay, products=[''])
            k.save()

    todaysProducts = createTodaysProductList()
    for product in todaysProducts['products']:
        print(product['itemNumber'])
        try:
            #Look Up Product Gluten, USDA, Name from BaseProduct Model
            p = Product.objects.get(item_number = product['itemNumber'], production_date = todaysProductionDay)
        except Product.DoesNotExist:
            #Look Up Product Gluten, USDA, Name from BaseProduct Model
            p = Product(item_number = product['itemNumber'], production_date = todaysProductionDay, tags=[''])
            p.save()

    context = {
        'todays_date' : today,
        'todays_production_day' : todaysProductionDay,
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
    strippedScheduleDay = removeEmptyCellsFromScheduleDay(scheduleDay)
    return strippedScheduleDay
