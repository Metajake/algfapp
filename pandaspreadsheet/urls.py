from django.urls import path

from . import views

urlpatterns = [
    path('', views.spreadsheet, name='spreadsheet'),
]
