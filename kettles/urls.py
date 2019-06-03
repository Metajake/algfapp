from django.urls import path

from . import views

urlpatterns = [
    path('', views.kettle_home, name="kettle_home"),
    path('assign/', views.assignment_days, name="assign_days"),
    path('assign/<str:date_to_assign>', views.assignment_date, name="assign_date"),
    path('list/', views.list, name="list_days"),
    path('list/<str:list_date>/<str:detail>', views.list_day, name="list_date"),
    path('list/active/', views.list_active, name="list_active"),
    #ajax views
    path('list/<str:list_date>/update_list_day/', views.update_list_day, name="update_list_day"),
    path('list/active/update_list_active/', views.update_list_active, name="update_list_active"),
]
