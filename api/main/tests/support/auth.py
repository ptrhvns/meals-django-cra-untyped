from rest_framework import test


def authenticate(request, user):
    test.force_authenticate(request, user=user)
    request.user = user
