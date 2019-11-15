from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

import re, json
from datetime import date, timedelta, datetime

from .models import Product, CalendarDay, CalendarWeek, CalendarDay2
from .forms import ProductForm
from products.models import Product as BaseProduct

def index(request):
    return render(request, 'productionschedule/index.html')

def calendar(request):
    if request.method == "GET":
        context = {
            'weeks' : constructCalendar(),
            'formUpdate': ProductForm(),
        }
    else:
        print("Posting")
        #Post Data to DB
    return render(request, 'productionschedule/calendar.html', context)

def today(request):
    today = date.today()
    c = CalendarDay.objects.get(production_date = today)
    products = []
    itemOrder = c.item_order.split(",")
    for item in itemOrder:
        newItem = item.strip()
        if len(newItem) != 0:
            products.append( Product.objects.filter(pk=int(newItem))[0] )
    context = {
        'day' : c,
        'products' : products,
    }
    print(c)
    return render(request, 'productionschedule/today.html', context)

def deleteObject(request, product_id, production_date, order):
    if order == "_":
        order = ""
    Product.objects.get(pk=product_id).delete()
    c = CalendarDay.objects.filter(production_date = datetime.strptime(production_date, "%Y-%m-%d"))
    c.update(item_order = order)
    return HttpResponse("Deleting: "+str(product_id))

def saveObject(request, production_date, product_code, company):
    if product_code == '_':
        product_code = ''
    if company == '_':
        company = ''
    p = Product(product_code=product_code, customer=company, production_date=production_date)
    p.save()
    return HttpResponse(p.id)

def updateObject(request, id, production_date, product_code, company, order):
    if product_code == '_':
        product_code = ''
    if company == '_':
        company = ''
    Product.objects.filter(pk=id).update(product_code=product_code, customer=company, production_date=production_date)
    c = CalendarDay.objects.filter(production_date = datetime.strptime(production_date, "%Y-%m-%d"))
    c.update(item_order = order)
    return HttpResponse("updated")

def updateScheduleDay(request, production_date, order):
    if order == "_":
        order = ""
    c = CalendarDay.objects.filter(production_date = datetime.strptime(production_date, "%Y-%m-%d"))
    c.update(item_order = order)
    return HttpResponse("updated")

def updateNote(request, id, note):
    if note == "_":
        note = ""
    p = Product.objects.filter(pk = id);
    p.update(note = note)
    return HttpResponse("Note Updated")

def constructCalendar():
    today = date.today()
    weeks = [
        constructWeek(today),
        constructWeek(today + timedelta(days=7)),
        constructWeek(today + timedelta(days=14)),
    ]
    return weeks

def constructWeek(day):
    toReturn = {}
    toReturn['today'] = day
    toReturn['weekStart'] = toReturn['today'] - timedelta(days=toReturn['today'].weekday())
    toReturn['weekEnd'] = toReturn['weekStart'] + timedelta(days=6)
    toReturn['range'] = []
    for single_date in daterange(toReturn['weekStart'], toReturn['weekEnd']):
        rangeEntry = {}
        rangeEntry['date'] = single_date.strftime("%Y-%m-%d")
        rangeEntry['products'] = []
        c = CalendarDay.objects.filter(production_date = rangeEntry['date'])
        if c.count() == 0:
            newC = CalendarDay(production_date = rangeEntry['date'])
            newC.save()
        else:
            itemOrder = c[0].item_order.split(",")
            for item in itemOrder:
                newItem = item.strip()
                if len(newItem) != 0:
                    rangeEntry['products'].append( Product.objects.filter(pk=int(newItem))[0] )
        # rangeEntry['products'] = Product.objects.filter(production_date = rangeEntry['date'])
        toReturn['range'].append(rangeEntry)

    toReturn['products'] = []
    return toReturn

def daterange(start_date, end_date):
    for n in range(int ((end_date - start_date).days)):
        yield start_date + timedelta(n)

def constructExcelCalendar():
    today = date.today()
    weeks = [
        constructExcelWeek(today),
        constructExcelWeek(today + timedelta(days=7)),
        # constructExcelWeek(today + timedelta(days=14)),
    ]
    return weeks

def constructExcelWeek(day):
    toReturn = {}
    toReturn['today'] = day
    toReturn['weekStart'] = toReturn['today'] - timedelta(days=toReturn['today'].weekday())
    toReturn['weekEnd'] = toReturn['weekStart'] + timedelta(days=6)
    toReturn['range'] = []
    for single_date in daterange(toReturn['weekStart'], toReturn['weekEnd']):
        rangeEntry = {}
        rangeEntry['date'] = single_date.strftime("%Y-%m-%d")
        toReturn['range'].append(rangeEntry)
    return toReturn

def excel(request):
    context = {}

    return render(request, 'productionschedule/excel.html', context)

def excel2(request):
    context = {}
    return render(request, 'productionschedule/excel2.html', context)

def ajaxGetCalendars(request):
    currentAndUpcomingWeeks = constructExcelCalendar()
    for week in currentAndUpcomingWeeks:
        try:
            cw = CalendarWeek.objects.get(date=week['weekStart'])
        except CalendarWeek.DoesNotExist:
            cw = CalendarWeek(date=week['weekStart'])
            cw.data = [[]]
            for day in week['range']:
                cw.data[0].append(day['date'])
            cw.save()
        # for day in week['range']:
        #     print(day['date'])

    existingWeeks = CalendarWeek.objects.all()

    toReturn = []

    for week in existingWeeks:
        toReturn.append(week.data)

    context = {
        'weeks' : existingWeeks,
    }
    print(toReturn)
    return JsonResponse(toReturn, safe=False)
    # return render(request, 'productionschedule/ajax/current_and_upcoming_calendars.html', context)

def ajaxGetCalendars2(request):
    currentAndUpcomingWeeks = constructExcelCalendar()
    for week in currentAndUpcomingWeeks:
        try:
            cw = CalendarWeek.objects.get(date=week['weekStart'])
        except CalendarWeek.DoesNotExist:
            cw = CalendarWeek(date=week['weekStart'])
            cw.save()
        for day in week['range']:
            try:
                cd = CalendarDay2.objects.get(date = day['date'])
            except CalendarDay2.DoesNotExist:
                cd = CalendarDay2(date=day['date'], calendarWeek = cw )
                cd.data = [[None,None,None,None]]
                cd.save()

    calendarWeeks = CalendarWeek.objects.all()

    toReturn = {}

    for i, week in enumerate(calendarWeeks):
        toReturn[week.date.strftime('%m-%d-%y')] = []
        for day in week.weekdays.all():
            toReturn[week.date.strftime('%m-%d-%y')].append({
                'date' : day.date.strftime('%m-%d-%y'),
                'data' : day.data,
            })

    return JsonResponse(toReturn)

@csrf_exempt
def ajaxCheckProductName(request):
    itemNumberRegex = re.findall('\d+', request.POST['data'] )
    print(itemNumberRegex)

    if itemNumberRegex:
        itemNumber = itemNumberRegex[0]
        try:
            bp = BaseProduct.objects.get(item_number = itemNumber)
        except BaseProduct.DoesNotExist:
            print("This Item Does Not Exists in the DB")
            toReturn = "This Item Does Not Exists in the DB";
        else:
            print(" This Item Exists in the DB")
            toReturn = bp.product_name
    else:
        toReturn = ""


    return HttpResponse(toReturn)

@csrf_exempt
def ajaxUpdateDaySchedule(request):
    scheduleData = json.loads(request.POST['data'])
    scheduleDate = datetime.strptime(request.POST['date'], "%m-%d-%y")
    sd = CalendarDay2.objects.get(date=scheduleDate)
    sd.data = scheduleData['data']
    sd.save(update_fields=['data'])
    # print()
    return HttpResponse("Success")
