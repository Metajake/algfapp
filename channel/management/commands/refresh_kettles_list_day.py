from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    channel_layer = get_channel_layer()
    help = 'Periodic task to be run every minute.'

    def handle(self, *args, **options):
        print("Handle")
        async_to_sync(self.channel_layer.group_send)('kettles', {
            'type': 'update_list_day',
            'message': "Updating List Day",
        })
