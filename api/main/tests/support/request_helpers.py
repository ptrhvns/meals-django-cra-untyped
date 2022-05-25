from django import http
from rest_framework import test


def authenticate(request, user):
    test.force_authenticate(request, user=user)
    request.user = user


def add_query_string(url, dictionary):
    query_dict = http.QueryDict("", mutable=True)
    query_dict.update(dictionary)
    return f"{url}?{query_dict.urlencode()}"
