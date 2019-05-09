from django.db import models
from django.contrib.postgres.fields import ArrayField

from datetime import datetime

class ProductionDay(models.Model):
    date = models.DateField()

    def __str__(self):
        return self.date.strftime('%m/%d/%Y')

class Kettle(models.Model):
    kettle_number = models.CharField(max_length=20)
    production_date = models.ForeignKey(ProductionDay, related_name="kettles", on_delete=models.CASCADE, null=True, blank=True)
    products = ArrayField(models.CharField(max_length = 20, blank=True), blank=True, null=True)

    def __str__(self):
        return self.kettle_number

class Product(models.Model):
    creation_date = models.DateTimeField(auto_now_add=True, blank=True)
    update_time = models.DateTimeField(blank=True, null=True)
    item_number = models.CharField(max_length=20)
    product_name = models.CharField(blank=True, max_length = 100)
    gluten_free = models.BooleanField(blank=True, default = False)
    usda_product = models.BooleanField(blank=True, default = False)
    tags = ArrayField(models.CharField(max_length = 20, blank=True), blank=True)
    production_date = models.ForeignKey(ProductionDay, related_name="days_products", on_delete=models.CASCADE, null=True, blank=True)
    kettle = models.ForeignKey(Kettle, related_name="days_products", on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.item_number + ' ' + self.product_name

    class Meta:
        ordering = ['creation_date', 'update_time']
