from django.contrib import admin

from .models import Product, CalendarDay, CalendarWeek, CalendarDay2

# admin.site.register(Product)
# admin.site.register(CalendarDay)
admin.site.register(CalendarWeek)
admin.site.register(CalendarDay2)
