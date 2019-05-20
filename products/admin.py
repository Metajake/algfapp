from django.contrib import admin

from .models import Product


class ProductAdmin(admin.ModelAdmin):
    ordering = ['item_number']

admin.site.register(Product, ProductAdmin)
