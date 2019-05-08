from django.db import models
from django.contrib.postgres.fields import ArrayField

class ProductionDay(models.Model):
    date = models.DateField()

    def __str__(self):
        return self.date.strftime('%m/%d/%Y')

class Kettle(models.Model):
    kettle_number = models.CharField(max_length=20)
    production_date = models.ForeignKey(ProductionDay, related_name="kettles", on_delete=models.CASCADE)
    products = ArrayField(models.CharField(max_length = 20, blank=True), blank=True, null=True) 

    def __str__(self):
        return self.kettle_number

class Product(models.Model):
    item_number = models.CharField(max_length=10)
    product_name = models.CharField(blank=True, max_length = 100)
    gluten_free = models.BooleanField(blank=True, default = False)
    usda_product = models.BooleanField(blank=True, default = False)
    kettles = models.ManyToManyField(Kettle, blank=True)

    def __str__(self):
        return self.item_number + ' ' + self.product_name
