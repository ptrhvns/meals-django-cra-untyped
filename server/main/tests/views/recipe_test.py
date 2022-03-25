import pytest
from django import http, urls
from rest_framework import permissions, status, test

from main import views
from main.tests import factories
from main.tests.support import drf_view_helpers as dvh


def test_http_method_names():
    assert dvh.has_http_method_names(views.recipe, ["get", "options"])


def test_permission_classes():
    permission_classes = [permissions.IsAuthenticated]
    assert dvh.has_permission_classes(views.recipe, permission_classes)


@pytest.mark.django_db
def test_getting_recipe_successfully(api_rf, mocker):
    user = factories.UserFactory.build()
    recipe = factories.RecipeFactory.build(id=777, user=user)
    request = api_rf.get(urls.reverse("recipe", kwargs={"recipe_id": recipe.id}))
    test.force_authenticate(request, user=user)
    request.user = user
    goo4 = mocker.patch("main.views.shortcuts.get_object_or_404", autospec=True)
    goo4.return_value = recipe
    response = views.recipe(request, recipe.id)
    assert response.status_code == status.HTTP_200_OK
    assert response.data == {
        "data": {"id": recipe.id, "recipe_times": [], "title": recipe.title}
    }


def test_getting_missing_recipe(api_rf, mocker):
    user = factories.UserFactory.build()
    request = api_rf.get(urls.reverse("recipe", kwargs={"recipe_id": 777}))
    test.force_authenticate(request, user=user)
    request.user = user
    goo4 = mocker.patch("main.views.shortcuts.get_object_or_404", autospec=True)
    goo4.side_effect = http.Http404
    response = views.recipe(request, 777)
    assert response.status_code == status.HTTP_404_NOT_FOUND
