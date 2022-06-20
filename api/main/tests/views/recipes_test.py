import json

import factory
import pytest
from django import urls
from rest_framework import permissions, status, test

from main import views
from main.tests import factories
from main.tests.support import drf_view_helpers as dvh
from main.tests.support.auth import authenticate


def test_http_method_names():
    assert dvh.has_http_method_names(views.recipes, ["get", "options"])


def test_permission_classes():
    permission_classes = [permissions.IsAuthenticated]
    assert dvh.has_permission_classes(views.recipes, permission_classes)


@pytest.mark.django_db
def test_getting_recipes_successfully(api_rf, mocker):
    user = factories.UserFactory.build()
    recipes = factories.RecipeFactory.build_batch(
        id=factory.Sequence(lambda n: n + 1), size=2, user=user
    )
    request = api_rf.get(urls.reverse("recipes"))
    test.force_authenticate(request, user=user)
    request.user = user
    recipe_mock = mocker.MagicMock()
    recipe_mock.objects.filter().all.return_value = recipes
    mocker.patch("main.views.models.Recipe", new=recipe_mock)
    response = views.recipes(request)
    response.render()
    assert response.status_code == status.HTTP_200_OK
    assert json.loads(response.content) == {
        "data": [
            {"id": recipes[0].id, "title": recipes[0].title},
            {"id": recipes[1].id, "title": recipes[1].title},
        ],
    }


def test_getting_empty_recipes(api_rf, mocker):
    user = factories.UserFactory.build()
    request = api_rf.get(urls.reverse("recipes"))
    authenticate(request, user)
    recipe_mock = mocker.MagicMock()
    recipe_mock.objects.filter().all.return_value = []
    mocker.patch("main.views.models.Recipe", new=recipe_mock)
    response = views.recipes(request)
    response.render()
    assert response.status_code == status.HTTP_200_OK
    assert json.loads(response.content) == {"data": []}
