from django.shortcuts import render
from django.http import HttpResponse
from django.utils import timezone

from datetime import date, timedelta
import json

from .models import Product
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

def deleteObject(request, product_id):
    Product.objects.get(pk=product_id).delete()
    return HttpResponse("Deleting: "+str(product_id))

def saveObject(request, production_date, product_code, company):
    if product_code == '_':
        product_code = ''
    if company == '_':
        company = ''
    p = Product(product_code=product_code, customer=company, production_date=production_date)
    p.save()
    return HttpResponse(p.id)

def updateObject(request, id, production_date, product_code, company):
    if product_code == '_':
        product_code = ''
    if company == '_':
        company = ''
    Product.objects.filter(pk=id).update(product_code=product_code, customer=company, production_date=production_date)
    return HttpResponse(str(id) + " updated")

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
        rangeEntry['products'] = Product.objects.filter(production_date = rangeEntry['date'])
        toReturn['range'].append(rangeEntry)

    toReturn['products'] = []
    return toReturn

def daterange(start_date, end_date):
    for n in range(int ((end_date - start_date).days)):
        yield start_date + timedelta(n)
