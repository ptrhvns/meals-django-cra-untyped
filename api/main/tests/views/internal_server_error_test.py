import json

from django import http, test, urls
from rest_framework import status

from main import views


def fake_view(request):
    raise http.HttpResponse(status=500)


urlpatterns = [
    urls.path("500/", fake_view),
]

handler404 = views.internal_server_error


@test.override_settings(ROOT_URLCONF=__name__)
def test_bad_request(rf):
    request = rf.get("/500/")
    response = views.internal_server_error(request)
    assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    assert len(json.loads(response.content)) > 0
