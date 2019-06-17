from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.core.management.base import BaseCommand, CommandError

class Command(BaseCommand):
    # channel_layer = get_channel_layer()
    help = 'Periodic task to be run every hour.'

    def handle(self, *args, **options):
        print("Handle")

        # async_to_sync(channel_layer.send)('background-tasks', {'type': 'task_1_hour'})
