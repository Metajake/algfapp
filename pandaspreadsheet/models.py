from django.db import models

class Product(models.Model):
    item_number = models.TextField()
    customer = models.TextField(blank=True)
    production_date = models.DateField(blank=True)
    kettle_number = models.TextField(blank=True)
