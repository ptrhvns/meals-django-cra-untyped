import datetime

import pytest
from django import urls
from django.utils import timezone
from rest_framework import status

from main import client as main_client
from main import models, views
from main.tests.support import drf_view_helpers as dvh


def test_http_method_names():
    assert dvh.has_http_method_names(views.signup, ["options", "post"])


def test_signing_up_with_invalid_data(client):
    response = client.post(urls.reverse("signup"), {})
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    json = response.json()
    assert len(json["errors"]) > 0
    assert len(json["message"]) > 0


@pytest.mark.django_db
def test_signing_up(client, freezer, mocker):
    data = {
        "email": "smith@example.com",
        "password": "alongpassword",
        "username": "smith",
    }

    assert models.User.objects.filter(username=data["username"]).count() == 0

    delay_mock = mocker.patch("main.tasks.send_signup_confirmation.delay")
    response = client.post(urls.reverse("signup"), data)
    data.pop("password")
    assert response.status_code == status.HTTP_201_CREATED

    json = response.json()
    assert len(json["message"]) > 0

    user = models.User.objects.get(**data)
    data["id"] = user.id
    assert json["data"] == data

    token = user.tokens.get(category=models.Token.EMAIL_CONFIRMATION)
    assert token.expiration == timezone.now() + datetime.timedelta(hours=24)

    site_uri = main_client.urls["home"]
    confirmation_uri = main_client.urls["signup_confirmation"].format(token=token.token)
    delay_mock.assert_called_with(user.id, site_uri, confirmation_uri)
