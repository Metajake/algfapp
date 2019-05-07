from django.urls import path

from . import views

urlpatterns = [
    path('edit/', views.edit, name="edit"),
    path('list/', views.list, name="list"),
]
