from django import template
register = template.Library()

import datetime

@register.filter
def sort_by(queryset, order):
    return queryset.order_by(order)

@register.filter
def print_timestamp(timestamp):
    try:
        #assume, that timestamp is given in seconds with decimal point
        ts = float(timestamp)
    except ValueError:
        return None
    return datetime.datetime.fromtimestamp(ts)

@register.filter
def whole_float_to_int(numberToCheck):
    if (numberToCheck >= 1.0):
        numberToCheck = int( numberToCheck )
    return numberToCheck
