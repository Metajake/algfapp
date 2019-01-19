from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('calendar/', views.calendar, name="calendar"),
    path('delete/<int:product_id>/', views.deleteObject, name='delete-object'),
]
