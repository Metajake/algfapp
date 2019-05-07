from django.shortcuts import render

from products.models import Product

def edit(request):
    context = {
        'message' : "yoyo"
    }
    return render(request, 'kettles/edit.html', context)

def list(request):
    products = Product.objects.all()
    context = {
        'products' : products
    }
    return render(request, 'kettles/list.html', context)
