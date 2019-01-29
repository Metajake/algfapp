from django.shortcuts import render
from django.http import HttpResponse
from django.utils import timezone

from datetime import date, timedelta, datetime

from .models import Product, CalendarDay
from .forms import ProductForm

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

def deleteObject(request, product_id, production_date, order):
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
    c = CalendarDay.objects.filter(production_date = datetime.strptime(production_date, "%Y-%m-%d"))
    c.update(item_order = order)
    return HttpResponse("updated")

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
