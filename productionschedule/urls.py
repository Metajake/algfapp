from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('calendar/', views.calendar, name="calendar"),
    path('delete/<int:product_id>/<str:production_date>/<str:order>', views.deleteObject, name='delete-object'),
    path('save/<str:production_date>/<str:product_code>/<str:company>/', views.saveObject, name='save-object'),
    path('update/<str:id>/<str:production_date>/<str:product_code>/<str:company>/<str:order>', views.updateObject, name='update-object'),
    path('updateScheduleDay/<str:production_date>/<str:order>', views.updateScheduleDay, name='update-schedule-day'),
    path('updateNote/<str:id>/<str:note>', views.updateNote, name='update-note'),
    path('today/', views.today, name="today"),
    path('excel/', views.excel, name="excel"),
    path('excel2/', views.excel2, name="excel2"),
    #ajax views
    path('excel/ajax/get_calendars/', views.ajaxGetCalendars, name="ajax-get-calendars"),
    path('excel2/ajax/get_calendars/', views.ajaxGetCalendars2, name="ajax-get-calendars2"),
    path('excel2/ajax/check_product_name/', views.ajaxCheckProductName, name="ajax-check-product-name"),
    path('excel2/ajax/update_day_schedule/', views.ajaxUpdateDaySchedule, name="ajax-update-day-schedule"),
]
