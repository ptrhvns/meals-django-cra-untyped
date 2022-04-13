import pytest
from django import urls
from rest_framework import status

from main import models, views
from main.tests.support import drf_view_helpers as dvh


def test_http_method_names():
    assert dvh.has_http_method_names(views.login, ["options", "post"])


def test_logging_in_with_invalid_data(client):
    response = client.post(urls.reverse("login"), {})
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    json = response.json()
    assert len(json["errors"]) > 0
    assert len(json["message"]) > 0


@pytest.mark.django_db
def test_logging_in_successfully(client):
    models.User.objects.create_user(
        email="smith@example.com",
        is_active=True,
        password="alongpassword",
        username="smith",
    )

    response = client.post(
        urls.reverse("login"), {"password": "alongpassword", "username": "smith"}
    )

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert "sessionid" in response.cookies.keys()


@pytest.mark.django_db
def test_logging_in_with_invalid_credentials(client):
    models.User.objects.create_user(
        email="smith@example.com",
        is_active=True,
        password="alongpassword",
        username="smith",
    )

    response = client.post(
        urls.reverse("login"), {"password": "invalid", "username": "smith"}
    )

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    assert len(response.json()["message"]) > 0


@pytest.mark.django_db
def test_logging_in_with_an_inactive_user(client):
    models.User.objects.create_user(
        email="smith@example.com",
        is_active=False,
        password="alongpassword",
        username="smith",
    )

    response = client.post(
        urls.reverse("login"), {"password": "alongpassword", "username": "smith"}
    )

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    assert len(response.json()["message"]) > 0
