from django.db import models

class Product(models.Model):
    item_number = models.CharField(max_length=10)
    product_name = models.CharField(max_length = 100)
    gluten_free = models.BooleanField(default = False)
    usda_product = models.BooleanField(default = False)

    def __str__(self):
        return self.item_number
