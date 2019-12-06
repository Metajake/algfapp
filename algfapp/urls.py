from django.contrib import admin
from django.urls import path, include
from django.conf.urls import url

urlpatterns = [
    path('admin/', admin.site.urls),
    path('schedule/', include('productionschedule.urls')),
    path('prod/', include('pandaspreadsheet.urls')),
    url(r'^channel/', include('channel.urls')),
    path('', include('kettles.urls')),
]
