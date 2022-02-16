from django import urls
from rest_framework import permissions, status, test

from main import views
from main.tests import factories


def test_allowed_http_method_names():
    method_names = sorted(views.delete_account.view_class.http_method_names)
    assert method_names == ["options", "post"]


def test_required_permissions():
    permission_classes = views.delete_account.view_class.permission_classes
    assert permission_classes == [permissions.IsAuthenticated]


def test_invalid_request_data(api_rf):
    request = api_rf.post(urls.reverse("delete_account"), {})
    user = factories.UserFactory.build()
    test.force_authenticate(request, user=user)
    response = views.delete_account(request)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    assert len(response.data["errors"]) > 0
    assert len(response.data["message"]) > 0


def test_incorrect_password(api_rf):
    request = api_rf.post(urls.reverse("delete_account"), {"password": "invalid"})
    user = factories.UserFactory.build()
    test.force_authenticate(request, user=user)
    response = views.delete_account(request)
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert len(response.data["message"]) > 0


def test_deleting_account_successfully(api_rf, mocker):
    password = "alongpassword"
    user = factories.UserFactory.build(password=password)
    delete_mock = mocker.patch.object(user, "delete", autospec=True)

    request = api_rf.post(urls.reverse("delete_account"), {"password": password})
    test.force_authenticate(request, user=user)
    request.user = user
    request.session = {}
    logout_mock = mocker.patch("django.contrib.auth.logout")

    response = views.delete_account(request)

    delete_mock.assert_called()
    logout_mock.assert_called()
    assert response.status_code == status.HTTP_204_NO_CONTENT
