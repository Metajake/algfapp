from django.db import models

class Product(models.Model):
    product_code = models.CharField(max_length=50)
    customer = models.CharField(max_length = 50)
    production_date = models.DateField()
    production_complete = models.BooleanField()
    note = models.CharField(max_length = 100, blank=True)
    def __str__(self):
        return self.product_code+self.customer
