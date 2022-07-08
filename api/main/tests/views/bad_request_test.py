import json

from django import test, urls
from django.core import exceptions
from rest_framework import status

from main import views


def fake_view(request):
    raise exceptions.SuspiciousOperation


urlpatterns = [
    urls.path("400/", fake_view),
]

handler400 = views.bad_request


@test.override_settings(ROOT_URLCONF=__name__)
def test_bad_request(rf):
    request = rf.get("/400/")
    response = views.bad_request(request)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert len(json.loads(response.content)) > 0
