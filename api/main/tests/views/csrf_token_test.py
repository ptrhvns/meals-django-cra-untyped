from django import urls
from rest_framework import status

from main import views
from main.tests.support import drf_view_helpers as dvh


def test_csrf_cookie(client):
    response = client.get(urls.reverse("csrf_token"))
    assert len(response.client.cookies["csrftoken"]) > 0


def test_http_method_names():
    assert dvh.has_http_method_names(views.csrf_token, ["get", "options"])


def test_status(client):
    response = client.get(urls.reverse("csrf_token"))
    assert response.status_code == status.HTTP_204_NO_CONTENT
