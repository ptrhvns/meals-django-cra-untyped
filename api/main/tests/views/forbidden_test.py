import json

from django import test, urls
from django.core import exceptions
from rest_framework import status

from main import views


def fake_view(request):
    raise exceptions.PermissionDenied


urlpatterns = [
    urls.path("403/", fake_view),
]

handler403 = views.forbidden


@test.override_settings(ROOT_URLCONF=__name__)
def test_bad_request(rf):
    request = rf.get("/403/")
    response = views.forbidden(request)
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert len(json.loads(response.content)) > 0
