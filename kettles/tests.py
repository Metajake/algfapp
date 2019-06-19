from django.test import TestCase, Client
from django.urls import reverse, resolve
from django.test.client import RequestFactory

from datetime import date

from kettles.urls import urlpatterns
from kettles.models import ProductionDay
from kettles.views import update_list_active, update_list_day

class KettleTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.productionDayInstance1 = ProductionDay.objects.create(date=date.today())
        self.factory = RequestFactory()

    def test_app_urls(self):
        self.assertEqual(self.client.get(reverse('kettle_home')).status_code, 200)
        self.assertEqual(self.client.get(reverse('assign_days')).status_code, 200)
        self.assertEqual(self.client.get(reverse('assign_calendar')).status_code, 200)
        self.assertEqual(self.client.get(reverse(
            'assign_date',
            kwargs={'date_to_assign' : self.productionDayInstance1 }
        )).status_code, 200)
        self.assertEqual(self.client.get(reverse('list_days')).status_code, 200)
        self.assertEqual(self.client.get(reverse(
            'list_date',
            kwargs={
                'list_date' : self.productionDayInstance1,
                'detail' : 'detail_true',
            },
        )).status_code, 200)
        self.assertEqual(self.client.get(reverse('list_active')).status_code, 200)
        self.assertEqual(self.client.get(reverse('list_daily')).status_code, 200)
        self.assertEqual(self.client.get(reverse('stats')).status_code, 200)
        self.assertEqual(self.client.get(reverse('stats_overall')).status_code, 200)
        self.assertEqual(self.client.get(reverse(
            'stats_day',
            kwargs={ 'stats_date' : self.productionDayInstance1 },
        )).status_code, 200)


        kettleListUpdateActiveRequest = self.factory.get(reverse('update_list_active'), {'date': self.productionDayInstance1}, content_type='application/json')
        updateListActiveResponse = update_list_active(kettleListUpdateActiveRequest)
        self.assertEqual(updateListActiveResponse.status_code, 200)

        kettleListUpdateRequest = self.factory.get(reverse('update_list_day', kwargs={'list_date':self.productionDayInstance1}), {'date': self.productionDayInstance1}, content_type='application/json')
        updateListDayResponse = update_list_day(kettleListUpdateRequest, self.productionDayInstance1)
        self.assertEqual(updateListDayResponse.status_code, 200)
