from django.db import models

class Product(models.Model):
    product_code = models.CharField(max_length=50, blank=True)
    customer = models.CharField(max_length = 50, blank=True)
    production_date = models.DateField()
    production_complete = models.BooleanField(blank=True, default=False)
    note = models.CharField(max_length = 100, blank=True)
    def __str__(self):
        return self.product_code+self.customer

class CalendarDay(models.Model):
    item_order = models.TextField()
