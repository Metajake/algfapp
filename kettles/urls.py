from django.urls import path

from . import views

urlpatterns = [
    path('', views.this_week, name="thisweek"),
    path('today/', views.today, name="today"),
    path('edit/', views.edit, name="edit"),
    path('list/', views.list, name="list"),
]
