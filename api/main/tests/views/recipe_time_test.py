from django import http, urls
from rest_framework import permissions, status

from main import models, views
from main.tests import factories
from main.tests.support import drf_view_helpers as dvh
from main.tests.support.request_helpers import authenticate


def test_http_method_names():
    assert dvh.has_http_method_names(views.recipe_time, ["get", "options"])


def test_permission_classes():
    permission_classes = [permissions.IsAuthenticated]
    assert dvh.has_permission_classes(views.recipe_time, permission_classes)


def test_recipe_time_not_found(api_rf, mocker):
    path = urls.reverse("recipe_time", kwargs={"time_id": 1})
    request = api_rf.get(path)
    user = factories.UserFactory.build()
    authenticate(request, user)
    mocker.patch(
        "main.views.shortcuts.get_object_or_404",
        autospec=True,
        side_effect=http.Http404,
    )
    response = views.recipe_time(request, 1)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_getting_recipe_time_successfully(api_rf, mocker):
    user = factories.UserFactory.build()
    path = urls.reverse("recipe_time", kwargs={"time_id": 1})
    request = api_rf.get(path)
    authenticate(request, user)
    recipe = factories.RecipeFactory.build(user=user, id=1)
    recipe_time_fields = {
        "days": 1,
        "hours": 2,
        "id": 1,
        "minutes": 3,
        "note": "Test note",
        "time_type": models.RecipeTime.COOK,
    }
    recipe_time = factories.RecipeTimeFactory.build(recipe=recipe, **recipe_time_fields)
    mocker.patch(
        "main.views.shortcuts.get_object_or_404",
        autospec=True,
        return_value=recipe_time,
    )
    response = views.recipe_time(request, 1)
    assert response.status_code == status.HTTP_200_OK
    assert response.data == {"data": recipe_time_fields}
