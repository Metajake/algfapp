from django.contrib import admin

from .models import Product, CalendarDay, CalendarWeek, ExcelCalendarDay

# admin.site.register(Product)
# admin.site.register(CalendarDay)
admin.site.register(CalendarWeek)
admin.site.register(CalendarDay)
admin.site.register(ExcelCalendarDay)
