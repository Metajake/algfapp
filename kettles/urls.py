from django.urls import path

from . import views

urlpatterns = [
    path('assign/', views.assignment_days, name="list_days"),
    path('assign/<str:date_to_assign>', views.assignment_date, name="assignment_date"),
    path('list/', views.list, name="list"),
    path('list/<str:list_date>/', views.list_day, name="list_day"),
    #ajax views
    path('list/<str:list_date>/update_list_day/', views.update_list_day, name="update_list_day"),
]
