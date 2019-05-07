from django.contrib import admin

from .models import ProductionDay, Kettle, Product

admin.site.register(ProductionDay)
admin.site.register(Kettle)
admin.site.register(Product)
