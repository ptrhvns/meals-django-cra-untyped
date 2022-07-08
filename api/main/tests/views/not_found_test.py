import json

from django import http, test, urls
from rest_framework import status

from main import views


def fake_view(request):
    raise http.Http404


urlpatterns = [
    urls.path("404/", fake_view),
]

handler404 = views.not_found


@test.override_settings(ROOT_URLCONF=__name__)
def test_bad_request(rf):
    request = rf.get("/404/")
    response = views.not_found(request)
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert len(json.loads(response.content)) > 0
