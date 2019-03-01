from django.contrib import admin

from .models import Product, Kettle, CalendarDay

admin.site.register(Product)
admin.site.register(Kettle)
admin.site.register(CalendarDay)
