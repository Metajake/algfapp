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
            # Send "Kettle Update" message to room group
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
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'update_production_list',
                    'message': 'updating_production_list',
                    'date' : self.text_data_json['date'],
                }
            )
            # Send "Kettle Update" message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'update_kettle',
                    'message': 'updating_kettle',
                    'kettle' : self.text_data_json['kettle'],
                    'date' : self.text_data_json['date'],
                }
            )

        elif message == 'sortKettle':
            self.kettleReceive = await database_sync_to_async(self.sortKettle)()
            # Send "Kettle Update" message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'update_kettle',
                    'message': 'updating_kettle',
                    'kettle' : self.text_data_json['kettle'],
                    'date' : self.text_data_json['date'],
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
            schedule_number = self.text_data_json['product'],
            production_date = pd,
            multiple = self.text_data_json['multiple']
        )
        p.kettle = k
        if 'assigned' not in p.tags:
            p.tags.append('assigned')
        p.update_time = datetime.now()
        p.save(update_fields=['kettle', 'tags', 'update_time', 'kettle_order'])

    def removeFromKettle(self):
        dateFormatted = parser.parse(self.text_data_json['date']).strftime('%Y-%m-%d')
        pd = ProductionDay.objects.get(date = dateFormatted)
        p = Product.objects.get(
            schedule_number = self.text_data_json['product'],
            production_date = pd,
            multiple = self.text_data_json['multiple']
        )
        p.kettle = None
        if 'assigned' in p.tags:
            p.tags.remove('assigned')
        p.update_time = datetime.now()
        p.save(update_fields=['kettle', 'tags', 'update_time'])

    def sortKettle(self):
        dateFormatted = parser.parse(self.text_data_json['date']).strftime('%Y-%m-%d')
        pd = ProductionDay.objects.get(date = dateFormatted)

        for product in self.text_data_json['products']:
            p = Product.objects.get(
                schedule_number = product['product_number'],
                multiple = product['product_multiple'],
                production_date = pd,
            )
            p.kettle_order = product['kettle_order']
            p.update_time = datetime.now()
            p.save(update_fields=['kettle_order', 'update_time'])

    # Receive message from room group
    async def update_kettle(self, event):
        message = event['message']
        kettle = event['kettle']
        dateFormatted = parser.parse(event['date']).strftime('%Y-%m-%d')

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'kettle' : kettle,
            'date': dateFormatted,
        }))

    # Receive message from room group
    async def update_production_list(self, event):
        message = event['message']
        dateFormatted = parser.parse(event['date']).strftime('%Y-%m-%d')

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'date': dateFormatted,
        }))
