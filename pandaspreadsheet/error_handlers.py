from django.contrib import messages
from django.utils.deprecation import MiddlewareMixin

from pandaspreadsheet.exceptions import BusinessLogicException
from pandaspreadsheet.responses import RedirectToRefererResponse

# Mixin for compatibility with Django <1.10
class HandleBusinessExceptionMiddleware(MiddlewareMixin):
    def process_exception(self, request, exception):
        if isinstance(exception, BusinessLogicException):
            message = "Invalid operation %s" % exception
            messages.error(request, message)
            # return RedirectToRefererResponse(request)
