import pytest
from django.utils import timezone

from main import models
from main.tests import factories


@pytest.mark.django_db
def test_email_confirmations():
    size = 10

    factories.TokenFactory.create_batch(
        size, category=models.Token.EMAIL_CONFIRMATION, expiration=timezone.now()
    )

    assert models.Token.objects.email_confirmations().count() == size


def test_str():
    token = factories.TokenFactory.build()
    assert str(token) == token.token
