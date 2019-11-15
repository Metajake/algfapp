from django.db import models
from django.contrib.postgres.fields import ArrayField

class Product(models.Model):
    product_code = models.CharField(max_length=50, blank=True)
    customer = models.CharField(max_length = 50, blank=True)
    production_date = models.DateField()
    production_complete = models.BooleanField(blank=True, default=False)
    note = models.CharField(max_length = 100, blank=True)
    def __str__(self):
        return self.product_code+self.customer

class CalendarDay(models.Model):
    production_date = models.DateField()
    item_order = models.TextField(blank=True)
    def __str__(self):
        return str(self.production_date)

class CalendarWeek(models.Model):
    date = models.DateField(null=True)
    def __str__(self):
        return str(self.date)

class CalendarDay2(models.Model):
    date = models.DateField(null=True)
    data = ArrayField(ArrayField(models.CharField(max_length=100)), blank=True, null=True)
    calendarWeek = models.ForeignKey(CalendarWeek, related_name="weekdays", on_delete=True, blank=True, null=True)

    def __str__(self):
        return str(self.date)
