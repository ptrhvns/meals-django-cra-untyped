from django.views.decorators import csrf
from rest_framework import decorators as rf_decorators
from rest_framework import response, status


@csrf.ensure_csrf_cookie
@rf_decorators.api_view(http_method_names=["GET"])
def csrf_token_cookie(request):
    return response.Response(status=status.HTTP_204_NO_CONTENT)


@rf_decorators.api_view(http_method_names=["POST"])
def signup(request):
    return response.Response({"message": "debug"})
