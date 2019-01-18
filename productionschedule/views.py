from django.shortcuts import render
from django.http import HttpResponse
from django.utils import timezone

from datetime import date, timedelta

from .models import Product

def index(request):
    return HttpResponse("Hello, world. You're at the polls index.")

def calendar(request):
    today = date.today()
    products = Product.objects.all()
    weeks = [
        constructWeek(today),
        constructWeek(today + timedelta(days=7)),
        constructWeek(today + timedelta(days=14)),
    ]
    context = {
        'products' : products,
        'weeks' : weeks,
    }
    return render(request, 'productionschedule/calendar.html', context)


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
