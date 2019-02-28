from django.db import models

class Product(models.Model):
    item_number = models.TextField()
    customer = models.TextField(blank=True)
    production_date = models.DateField(blank=True)

    def __str__(self):
        return str(self.item_number)

class Kettle(models.Model):
    products = models.ManyToManyField(Product, blank=True)
    name = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return str(self.name)
