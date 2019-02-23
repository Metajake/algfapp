from django.contrib import admin
from django.urls import path, include
from django.conf.urls import url

urlpatterns = [
    path('admin/', admin.site.urls),
    # path('', include('productionschedule.urls')),
    path('', include('pandaspreadsheet.urls')),
    url(r'^channel/', include('channel.urls')),
]
