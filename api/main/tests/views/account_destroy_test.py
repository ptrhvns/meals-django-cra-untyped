from django import urls
from rest_framework import permissions, status

from main import views
from main.tests import factories
from main.tests.support import drf_view_helpers as dvh
from main.tests.support.request_helpers import authenticate


def test_http_method_names():
    assert dvh.has_http_method_names(views.account_destroy, ["options", "post"])


def test_permission_classes():
    permission_classes = [permissions.IsAuthenticated]
    assert dvh.has_permission_classes(views.account_destroy, permission_classes)


def test_invalid_request_data(api_rf):
    request = api_rf.post(urls.reverse("account_destroy"), {})
    user = factories.UserFactory.build()
    authenticate(request, user)
    response = views.account_destroy(request)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    assert len(response.data["errors"]) > 0
    assert len(response.data["message"]) > 0


def test_incorrect_password(api_rf):
    request = api_rf.post(urls.reverse("account_destroy"), {"password": "invalid"})
    user = factories.UserFactory.build()
    authenticate(request, user)
    response = views.account_destroy(request)
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert len(response.data["message"]) > 0


def test_deleting_account_successfully(api_rf, mocker):
    password = "alongpassword"
    user = factories.UserFactory.build(password=password)
    delete_mock = mocker.patch.object(user, "delete", autospec=True)
    request = api_rf.post(urls.reverse("account_destroy"), {"password": password})
    authenticate(request, user)
    request.session = {}
    logout_mock = mocker.patch("main.views.auth.logout")

    response = views.account_destroy(request)

    delete_mock.assert_called()
    logout_mock.assert_called()
    assert response.status_code == status.HTTP_204_NO_CONTENT
