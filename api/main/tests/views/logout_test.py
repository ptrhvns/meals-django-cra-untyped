import pytest
from django import urls
from rest_framework import permissions, status

from main import models, views
from main.tests.support import drf_view_helpers as dvh


def test_http_method_names():
    assert dvh.has_http_method_names(views.logout, ["options", "post"])


def test_required_permissions():
    permission_classes = views.logout.view_class.permission_classes
    assert permission_classes == [permissions.IsAuthenticated]


@pytest.mark.django_db
def test_logging_out_successfully(client, mocker):
    password = "alongpassword"

    user = models.User.objects.create_user(
        email="smith@example.com",
        is_active=True,
        password=password,
        username="smith",
    )

    logout_mock = mocker.patch("main.views.auth.logout")
    client.login(username=user.username, password=password)
    response = client.post(urls.reverse("logout"))
    assert response.status_code == status.HTTP_204_NO_CONTENT
    logout_mock.assert_called()
