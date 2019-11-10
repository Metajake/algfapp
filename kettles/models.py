from django.db import models
from django.contrib.postgres.fields import ArrayField

from datetime import datetime

class ProductionDay(models.Model):
    date = models.DateField()

    def has_kettle(self):
        return False if self.kettles.count() == 0 else True

    def has_products(self):
        return False if self.days_products.count() == 0 else True

    def __str__(self):
        return str(self.date)

class Kettle(models.Model):
    creation_date = models.DateTimeField(auto_now_add=True, blank=True)
    kettle_number = models.CharField(max_length=20)
    production_date = models.ForeignKey(ProductionDay, related_name="kettles", on_delete=models.CASCADE, null=True, blank=True)
    start_time = models.CharField(max_length=50, default='', blank=True, null=True)

    def __str__(self):
        return self.kettle_number

    class Meta:
        ordering = ['creation_date']

class Product(models.Model):
    creation_date = models.DateTimeField(auto_now_add=True, blank=True)
    item_number = models.CharField(max_length=20)
    schedule_number = models.CharField(max_length=100)
    product_name = models.CharField(blank=True, max_length = 100)
    assigned = models.BooleanField(blank=True, default=False)
    gluten_free = models.BooleanField(blank=True, default = False)
    production_date = models.ForeignKey(ProductionDay, related_name="days_products", on_delete=models.CASCADE, null=True, blank=True)
    kettle = models.ForeignKey(Kettle, related_name="days_products", on_delete=models.CASCADE, null=True, blank=True)
    kettle_order = models.IntegerField(blank=True, null=True)
    multiple = models.FloatField(blank=True, null=True)
    note = models.CharField(max_length=300, blank =True, null=True)
    is_complete = models.BooleanField(blank=True, default=False)
    #MAYBE GET RID OF THIS
    tags = ArrayField(models.CharField(max_length = 20, blank=True), blank=True)

    def __str__(self):
        return self.schedule_number + ' ' + self.product_name
