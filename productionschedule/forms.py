from django import forms

class ProductForm(forms.Form):
    data = forms.CharField(required = False)
