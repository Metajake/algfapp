from django.urls import path

from . import views

urlpatterns = [
    path('', views.schedule, name='schedule'),
    path('today/', views.today, name='today'),
]
