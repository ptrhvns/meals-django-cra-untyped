import datetime

import pytest
from django import urls
from django.utils import timezone
from rest_framework import status

from main import models, views
from main.tests import factories
from main.tests.support import drf_view_helpers as dvh


def test_http_method_names():
    assert dvh.has_http_method_names(views.signup_confirmation, ["options", "post"])


def test_confirming_signup_with_invalid_data(client):
    response = client.post(urls.reverse("signup_confirmation"), {})
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    json = response.json()
    assert len(json["errors"]) > 0
    assert len(json["message"]) > 0


@pytest.mark.django_db
def test_confirming_signup(client):
    user = factories.UserFactory.create()

    token = factories.TokenFactory.create(
        category=models.Token.EMAIL_CONFIRMATION,
        expiration=timezone.now() + datetime.timedelta(hours=24),
        user=user,
    )

    response = client.post(urls.reverse("signup_confirmation"), {"token": token.token})
    assert response.status_code == status.HTTP_200_OK
    json = response.json()
    assert len(json["message"]) > 0
    assert not models.Token.objects.filter(token=token.token).exists()
    user.refresh_from_db()
    assert user.email_confirmed_datetime is not None
    assert user.is_active is True


@pytest.mark.django_db
def test_confirming_signup_with_non_existant_token(client):
    response = client.post(urls.reverse("signup_confirmation"), {"token": "invalid"})
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    assert len(response.json()["message"]) > 0


@pytest.mark.django_db
def test_confirming_signup_with_expired_token(client):
    user = factories.UserFactory.create()
    expiration_in_the_past = timezone.now() - datetime.timedelta(hours=1)

    token = factories.TokenFactory.create(
        category=models.Token.EMAIL_CONFIRMATION,
        expiration=expiration_in_the_past,
        user=user,
    )

    response = client.post(urls.reverse("signup_confirmation"), {"token": token.token})
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    assert len(response.json()["message"]) > 0
    assert not models.Token.objects.filter(token=token.token).exists()
