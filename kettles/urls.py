from django.urls import path

from . import views

urlpatterns = [
    path('', views.kettle_home, name="kettle_home"),
    path('assign/', views.assignment_days, name="assign_days"),
    path('assign/<str:date_to_assign>', views.assignment_date, name="assign_date"),
    path('assign/calendar/', views.assign_calendar, name="assign_calendar"),
    path('list/', views.list, name="list_days"),
    path('list/<str:list_date>/<str:detail>', views.list_day, name="list_date"),
    path('list/active/', views.list_active, name="list_active"),
    path('stats/', views.stats, name="stats"),
    path('stats/overall/', views.stats_overall, name="stats_overall"),
    path('stats/days/<str:stats_date>/', views.stats_day, name="stats_day"),
    #ajax views
    path('list/<str:list_date>/update_list_day/', views.update_list_day, name="update_list_day"),
    path('list/active/update_list_active/', views.update_list_active, name="update_list_active"),
]
