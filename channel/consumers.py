from django.core import serializers

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer, AsyncWebsocketConsumer
from channels.db import database_sync_to_async

import json
from dateutil import parser
from datetime import datetime

from kettles.models import Kettle, ProductionDay, Product

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )

    # Receive message from room group
    def chat_message(self, event):
        message = event['message']

        # Send message to WebSocket
        self.send(text_data=json.dumps({
            'message': message
        }))

class KettleConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'kettles'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        self.text_data_json = json.loads(text_data)
        message = self.text_data_json['message']

        if message == 'addToKettle':
            self.kettleUpdate = await database_sync_to_async(self.addToKettle)()
            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'update_kettle',
                    'message': 'updating_kettle',
                    'kettle' : self.text_data_json['kettle'],
                    'date' : self.text_data_json['date'],
                }
            )

        elif message == 'removeFromKettle':
            self.productUpdate = await database_sync_to_async(self.removeFromKettle)()

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )

    def addToKettle(self):
        dateFormatted = parser.parse(self.text_data_json['date']).strftime('%Y-%m-%d')
        pd = ProductionDay.objects.get(date = dateFormatted)
        k = Kettle.objects.get(
            kettle_number = self.text_data_json['kettle'],
            production_date = pd
        )
        p = Product.objects.get(
            item_number = self.text_data_json['product'],
            production_date = pd
        )
        p.kettle = k
        if 'assigned' not in p.tags:
            p.tags.append('assigned')
        p.save(update_fields=['kettle', 'tags'])

    def removeFromKettle(self):
        dateFormatted = parser.parse(self.text_data_json['date']).strftime('%Y-%m-%d')
        pd = ProductionDay.objects.get(date = dateFormatted)
        p = Product.objects.get(
            item_number = self.text_data_json['product'],
            production_date = pd
        )
        p.kettle = None
        if 'assigned' in p.tags:
            p.tags.remove('assigned')
        p.update_time = datetime.now()
        p.save(update_fields=['kettle', 'tags', 'update_time'])

    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))

    # Receive message from room group
    async def update_kettle(self, event):
        message = event['message']
        kettle = event['kettle']
        dateFormatted = parser.parse(self.text_data_json['date']).strftime('%Y-%m-%d')

        pd = ProductionDay.objects.get(date = dateFormatted)
        kettleObject = Kettle.objects.get(
            kettle_number = kettle,
            production_date = pd
        )
        kettle_data = serializers.serialize("json", kettleObject.days_products.all())

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'kettle' : kettle,
            'html' : kettle_data,
        }))
