from django.core import serializers

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer, AsyncWebsocketConsumer
from channels.db import database_sync_to_async

import json
from dateutil import parser
from datetime import datetime, date

from kettles.models import Kettle, ProductionDay, Product

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

        if message == 'listSortReceive':
            # print('-------List Sort Receive--------')
            self.kettleReceive = await database_sync_to_async(self.receiveAndSortProductList)()
            #Send "Kettle Update" message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'update_products',
                    'message': 'updating_products',
                    'date' : self.text_data_json['date'],
                }
            )

        elif message == 'listSort':
            # print('-------List Sort--------')
            self.kettleReceive = await database_sync_to_async(self.sortProductList)()
            #Send "Kettle Update" message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'update_products',
                    'message': 'updating_products',
                    'date' : self.text_data_json['date'],
                }
            )

        elif message == 'toggleProductComplete':
            print('-----Toggling Product Complete--------')
            self.kettleReceive = await database_sync_to_async(self.toggleProductComplete)()
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "update_products",
                    'message' : 'updating_products',
                    'date' : self.text_data_json['date'],
                }
            )

    def receiveAndSortProductList(self):
        # print('-------Receive and Sorting Product List-------')
        dateFormatted = parser.parse(self.text_data_json['date']).strftime('%Y-%m-%d')
        pd = ProductionDay.objects.get(date = dateFormatted)
        product = Product.objects.get(
            schedule_number = self.text_data_json['product']['schedule_number'],
            multiple = self.text_data_json['product']['multiple'],
            production_date = pd,
        )
        if self.text_data_json['list'] == '':
            k = None
            assigned = False
        else:
            k = Kettle.objects.get(kettle_number = self.text_data_json['list'],production_date = pd)
            assigned = True
        product.kettle = k
        product.assigned = assigned
        product.save(update_fields=['kettle', 'assigned'])
        for prod in self.text_data_json['products']:
            p = Product.objects.get(
                schedule_number = prod['schedule_number'],
                multiple = prod['multiple'],
                production_date = pd,
            )
            p.kettle_order = prod['list_order']
            p.save(update_fields=['kettle_order'])

    def sortProductList(self):
        # print('-------Sorting Product List-------')
        dateFormatted = parser.parse(self.text_data_json['date']).strftime('%Y-%m-%d')
        pd = ProductionDay.objects.get(date = dateFormatted)
        for prod in self.text_data_json['products']:
            p = Product.objects.get(
                schedule_number = prod['schedule_number'],
                multiple = prod['multiple'],
                production_date = pd,
            )
            p.kettle_order = prod['list_order']
            p.save(update_fields=['kettle_order'])

    def toggleProductComplete(self):
        # print('----Toggling----')
        dateFormatted = parser.parse(self.text_data_json['date']).strftime('%Y-%m-%d')
        pd = ProductionDay.objects.get(date = dateFormatted)
        p = Product.objects.get(
            schedule_number = self.text_data_json['product']['schedule_number'],
            multiple = self.text_data_json['product']['multiple'],
            production_date = pd,
        )
        p.is_complete = self.text_data_json['isComplete']
        p.save(update_fields=['is_complete'])
    # Receive message from room group
    async def update_products(self, event):
        print('---------Updating Products Message---------')
        message = event['message']
        dateFormatted = parser.parse(event['date']).strftime('%Y-%m-%d')

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'date': dateFormatted,
        }))

    async def update_list_day(self, event):
        print('-----Update List Day-------')
        message = event['message']
        
        await self.send(text_data=json.dumps({
            'message': message,
            'date': date.today().strftime('%Y-%m-%d'),
        }))
