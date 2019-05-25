from django.contrib import admin

from .models import ProductionDay, Kettle, Product

class ProductInline(admin.TabularInline):
    model = Product

class ProductionDayAdmin(admin.ModelAdmin):
    inlines = [
        ProductInline,
    ]

admin.site.register(ProductionDay, ProductionDayAdmin)
admin.site.register(Kettle)
admin.site.register(Product)
