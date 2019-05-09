from django.urls import path

from . import views

urlpatterns = [
    path('', views.this_week, name="this_week"),
    path('today/', views.today, name="today"),
    path('testchannels/', views.testchannels, name="testchannels"),
    path('list/', views.list, name="list"),
    path('list/<str:list_date>/', views.list_day, name="list_day"),
]
