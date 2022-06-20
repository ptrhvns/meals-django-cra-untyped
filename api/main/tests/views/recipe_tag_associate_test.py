import pytest
from django import http, urls
from rest_framework import permissions, status

from main import models, views
from main.tests import factories
from main.tests.support import drf_view_helpers as dvh
from main.tests.support.request_helpers import authenticate


def test_http_method_names():
    assert dvh.has_http_method_names(views.recipe_tag_associate, ["options", "post"])


def test_permission_classes():
    permission_classes = [permissions.IsAuthenticated]
    assert dvh.has_permission_classes(views.recipe_tag_associate, permission_classes)


def test_recipe_not_found(api_rf, mocker):
    path = urls.reverse("recipe_tag_associate", kwargs={"recipe_id": 1})
    request = api_rf.post(path, {"name": "TestTag"})
    user = factories.UserFactory.build()
    authenticate(request, user)
    mocker.patch(
        "main.views.shortcuts.get_object_or_404",
        autospec=True,
        side_effect=http.Http404,
    )
    response = views.recipe_tag_associate(request, 1)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_invalid_request_data(api_rf, mocker):
    user = factories.UserFactory.build()
    recipe = factories.RecipeFactory.build(id=1, user=user)
    path = urls.reverse("recipe_tag_associate", kwargs={"recipe_id": recipe.id})
    request = api_rf.post(path, {})
    authenticate(request, user)
    mocker.patch(
        "main.views.shortcuts.get_object_or_404", autospec=True, return_value=recipe
    )
    response = views.recipe_tag_associate(request, recipe.id)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    assert len(response.data["errors"]) > 0
    assert len(response.data["message"]) > 0


@pytest.mark.django_db
def test_creating_recipe_tag_and_adding_recipe_successfully(api_rf):
    user = factories.UserFactory.create()
    recipe = factories.RecipeFactory.create(user=user)
    data = {"name": "TestTag"}
    request = api_rf.post(
        urls.reverse("recipe_tag_associate", kwargs={"recipe_id": recipe.id}), data
    )
    authenticate(request, user)
    response = views.recipe_tag_associate(request, recipe.id)
    recipe_tag_qs = models.RecipeTag.objects.filter(user=user).prefetch_related(
        "recipes"
    )
    assert recipe_tag_qs.count() == 1
    recipe_tag = recipe_tag_qs.first()
    assert recipe_tag.recipes.count() == 1
    assert recipe_tag.recipes.first() == recipe
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data == {"data": {"id": recipe_tag.id, "name": recipe_tag.name}}


@pytest.mark.django_db
def test_returning_already_created_recipe_tag_with_recipe(api_rf):
    user = factories.UserFactory.create()
    recipe = factories.RecipeFactory.create(user=user)
    recipe_tag = factories.RecipeTagFactory.create(user=user)
    recipe_tag.recipes.add(recipe)
    data = {"name": recipe_tag.name}
    request = api_rf.post(
        urls.reverse("recipe_tag_associate", kwargs={"recipe_id": recipe.id}), data
    )
    authenticate(request, user)
    response = views.recipe_tag_associate(request, recipe.id)
    assert response.status_code == status.HTTP_200_OK
    assert response.data == {"data": {"id": recipe_tag.id, "name": recipe_tag.name}}
