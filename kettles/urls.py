from django.urls import path

from . import views

urlpatterns = [
    path('', views.this_week, name="this_week"),
    path('today/', views.today, name="today"),
    path('testchannels/', views.testchannels, name="testchannels"),
    path('list/', views.list, name="list"),
    path('list/<str:list_date>/', views.list_day, name="list_day"),
    #ajax views
    path('today/update_kettle/', views.update_kettle, name="update_kettle"),
    path('today/update_production_list/', views.update_production_list, name="update_production_list"),
    path('list/<str:list_date>/update_list_day/', views.update_list_day, name="update_list_day"),
]
