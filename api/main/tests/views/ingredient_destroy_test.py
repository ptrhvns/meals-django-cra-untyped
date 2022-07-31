from django import http, urls
from rest_framework import permissions, status

from main import views
from main.tests import factories
from main.tests.support import drf_view_helpers as dvh
from main.tests.support.request_helpers import authenticate


def test_http_method_names():
    assert dvh.has_http_method_names(views.ingredient_destroy, ["options", "post"])


def test_permission_classes():
    permission_classes = [permissions.IsAuthenticated]
    assert dvh.has_permission_classes(views.ingredient_destroy, permission_classes)


def test_ingredient_not_found(api_rf, mocker):
    path = urls.reverse("ingredient_destroy", kwargs={"ingredient_id": 1})
    request = api_rf.post(path)
    user = factories.UserFactory.build()
    authenticate(request, user)
    mocker.patch(
        "main.views.shortcuts.get_object_or_404",
        autospec=True,
        side_effect=http.Http404,
    )
    response = views.ingredient_destroy(request, 1)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_destroying_ingredient_successfully(api_rf, mocker):
    path = urls.reverse("ingredient_destroy", kwargs={"ingredient_id": 1})
    request = api_rf.post(path)
    user = factories.UserFactory.build()
    authenticate(request, user)
    ingredient = mocker.MagicMock()
    mocker.patch(
        "main.views.shortcuts.get_object_or_404",
        autospec=True,
        return_value=ingredient,
    )
    response = views.ingredient_destroy(request, 1)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert ingredient.delete.called
