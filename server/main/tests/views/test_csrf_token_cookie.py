from django import urls
from rest_framework import status

from main import views


def test_csrf_cookie(client):
    response = client.get(urls.reverse("csrf_token_cookie"))
    assert len(response.client.cookies["csrftoken"]) > 0


def test_allowed_http_method_names():
    assert sorted(views.csrf_token_cookie.view_class.http_method_names) == [
        "get",
        "options",
    ]


def test_status(client):
    response = client.get(urls.reverse("csrf_token_cookie"))
    assert response.status_code == status.HTTP_204_NO_CONTENT
