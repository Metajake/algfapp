from django.urls import path

from . import views

urlpatterns = [
    path('', views.schedule, name='schedule'),
    path('test/', views.test, name='test'),
    path('today/', views.today, name='today'),
    path('list/', views.list, name='list'),
]
