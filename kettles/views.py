from django.shortcuts import render, render_to_response
from django.http import Http404
from django.core import serializers

import datetime, re, json
from datetime import date, timedelta
import pandas, xlrd, numpy
from dateutil import parser
from pandaspreadsheet.views import productionSpreadsheet, constructWeekRanges, parseCalendarFromSpreadsheet, applyViewTags, getTodaysScheduleFromSpreadsheet, getTodaysScheduleFromSpreadsheet, removeEmptyCellsFromScheduleDay, replaceNaN, multiplyScheduleDay, applyNotesToProducts, convertScheduleNumbersToItemNumbers, applyNotesToProductionWeek, getThisWeeksScheduleDays, getThisWeeksProductionSchedule, checkForDateNotification, getTaggedCalendar

from products.models import Product as BaseProduct
from .models import ProductionDay, Kettle, Product

def kettle_home(request):
    context={}
    return render(request, "kettles/home.html", context)

def assignment_days(request):
    try:
        todays_production_day = ProductionDay.objects.get(date=date.today())
    except ProductionDay.DoesNotExist:
        todays_production_day = ProductionDay(date=date.today())
        todays_production_day.save()

    assignment_days = ProductionDay.objects.all()
    #convert to return the past 7 days. To get older days you gotta click and "archive" link
    context = {
        'today' : date.today(),
        'tomorrow' : date.today() + timedelta(days=1),
        'days' : assignment_days,
    }
    return render(request, 'kettles/assignment_days.html', context)

def assignment_date(request, date_to_assign):
    theDate = parser.parse(date_to_assign).strftime('%Y-%m-%d')
    theDateDay = theDate[-2:]
    todaysProductionDay = checkAndCreateProductionDay(theDate)

    checkAndCreateKettles(todaysProductionDay)
    todaysProducts = createTodaysProductList(theDateDay)
    notification = checkForDateNotification(todaysProducts)
    checkAndCreateProducts(todaysProductionDay, todaysProducts)
    context = {
        'production_day' : todaysProductionDay,
        'todays_products': todaysProductionDay.days_products.all().order_by('creation_date'),
        'notification' : notification,
    }
    return render(request, 'kettles/assignment_date.html', context)

def list(request):
    productionDays = ProductionDay.objects.all()
    context = {
        'production_days' : productionDays,
    }
    return render(request, 'kettles/list.html', context)

def list_day(request, list_date, detail):
    formattedDate = parser.parse(list_date).strftime('%Y-%m-%d')
    theDateDay = formattedDate[-2:]

    taggedCalendar = getTaggedCalendar(productionSpreadsheet)
    thisWeeksSchedule = getThisWeeksProductionSchedule(taggedCalendar, theDateDay)
    productionWeek = getThisWeeksScheduleDays(thisWeeksSchedule)
    notedProductionWeek = applyNotesToProductionWeek(productionWeek)

    productionDay = ProductionDay.objects.get(date=formattedDate)
    if detail == 'detail_true':
        isDetail = True
    else:
        isDetail = False
    context = {
        'production_day' : productionDay,
        'is_detail' : isDetail,
        'production_week' : notedProductionWeek,
    }
    return render(request, 'kettles/list_day.html', context)

def list_active(request):
    latestProductionDay = ProductionDay.objects.latest('date')

    taggedCalendar = getTaggedCalendar(productionSpreadsheet)
    thisWeeksSchedule = getThisWeeksProductionSchedule(taggedCalendar, str(latestProductionDay)[-2:])
    productionWeek = getThisWeeksScheduleDays(thisWeeksSchedule)
    notedProductionWeek = applyNotesToProductionWeek(productionWeek)

    context = {
        'production_day': ProductionDay.objects.latest('date'),
        'production_week' : notedProductionWeek,
    }
    return render(request, 'kettles/list_active.html', context)

def stats(request):
    productionDays = ProductionDay.objects.all()
    context = {
        'production_days' : productionDays,
    }
    return render(request, 'kettles/stats/stats.html', context)

def stats_overall(request):
    productionDays = ProductionDay.objects.all().order_by("date").reverse()

    productionDaysData = []
    for day in productionDays:
        productionDaysData.append({"date":day.date.strftime('%m-%d-%Y'),"count":len( day.days_products.all() )})

    baseItems = []
    productCounts = []
    for item in BaseProduct.objects.all():
        productCounts.append( {"itemNumber": item.item_number, "count": len( Product.objects.filter(item_number=item.item_number) )} )

    context = {
        'production_days_data' : json.dumps(productionDaysData),
        'product_counts' : json.dumps(productCounts),
        'console_data' : json.dumps(productCounts),
    }
    return render(request, 'kettles/stats/stats_overall.html', context)

def stats_day(request, stats_date):
    formattedDate = parser.parse(stats_date).strftime('%Y-%m-%d')
    productionDay = ProductionDay.objects.get(date=formattedDate)
    context = {
        'production_day' : productionDay,
    }
    return render(request, 'kettles/stats/stats_day.html', context)

def update_list_day(request, list_date):
    pd = ProductionDay.objects.get(date=request.GET['date'])
    return render_to_response('kettles/update_list_day.html', {'production_day': pd})

def update_list_active(request):
    activeDate=request.GET['date']
    taggedCalendar = getTaggedCalendar(productionSpreadsheet)
    thisWeeksSchedule = getThisWeeksProductionSchedule(taggedCalendar, activeDate[-2:])
    productionWeek = getThisWeeksScheduleDays(thisWeeksSchedule)
    notedProductionWeek = applyNotesToProductionWeek(productionWeek)
    context = {
        'production_day' : ProductionDay.objects.get(date=activeDate),
        'production_week' : notedProductionWeek,
    }
    return render_to_response('kettles/update_list_active.html', context)

def checkAndCreateProductionDay(the_date):
    try:
        todaysProductionDay = ProductionDay.objects.get(date=the_date)
    except ProductionDay.DoesNotExist:
        todaysProductionDay = ProductionDay(date=the_date)
        todaysProductionDay.save()

    return todaysProductionDay

def checkAndCreateKettles(productionDayToKettle):
    kettle_numbers = ['K-1', 'K-2', 'K-3', 'K-4', 'K-5', 'K-6', 'TK-1', 'TK-2']

    if productionDayToKettle.has_kettle() == False:
        for i in kettle_numbers:
            try:
                k = Kettle.objects.get(kettle_number = i, production_date = productionDayToKettle)
            except Kettle.DoesNotExist:
                k = Kettle(kettle_number = i, production_date = productionDayToKettle)
                k.save()

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

def createTodaysProductList(dayToSchedule):
    weekRanges = constructWeekRanges(productionSpreadsheet)
    calendar = parseCalendarFromSpreadsheet(productionSpreadsheet, weekRanges)
    taggedCalendar = applyViewTags(calendar)
    scheduleDay = getTodaysScheduleFromSpreadsheet(taggedCalendar, dayToSchedule)
    multipliedScheduleDay = multiplyScheduleDay(scheduleDay)
    notedScheduleDay = applyNotesToProducts(multipliedScheduleDay)
    convertedScheduleDay = convertScheduleNumbersToItemNumbers(notedScheduleDay)
    strippedScheduleDay = removeEmptyCellsFromScheduleDay(convertedScheduleDay)
    return strippedScheduleDay
