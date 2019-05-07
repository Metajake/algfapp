from django.conf.urls import url

from . import consumers

websocket_urlpatterns = [
    url(r'^ws/channel/(?P<room_name>[^/]+)/$', consumers.ChatConsumer),
    url(r'ws/kettles/', consumers.KettleConsumer),
    # url(r'^ws/kettles/list/$', consumers.KettleConsumer),
]
