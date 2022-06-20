import pytest
from django import http, urls
from rest_framework import permissions, status

from main import models, views
from main.tests import factories
from main.tests.support import drf_view_helpers as dvh
from main.tests.support.request_helpers import authenticate


def test_http_method_names():
    assert dvh.has_http_method_names(
        views.recipe_tag_update_for_recipe, ["options", "post"]
    )


def test_permission_classes():
    permission_classes = [permissions.IsAuthenticated]
    assert dvh.has_permission_classes(
        views.recipe_tag_update_for_recipe, permission_classes
    )


def test_recipe_tag_not_found(api_rf, mocker):
    path = urls.reverse(
        "recipe_tag_update_for_recipe", kwargs={"tag_id": 1, "recipe_id": 1}
    )
    request = api_rf.post(path)
    user = factories.UserFactory.build()
    authenticate(request, user)

    def mock_get_object_or_404(*args, **kwargs):
        if args[0] == models.RecipeTag:
            raise http.Http404()

    mocker.patch(
        "main.views.shortcuts.get_object_or_404",
        mock_get_object_or_404,
    )

    response = views.recipe_tag_update_for_recipe(request, 1, 1)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_recipe_not_found(api_rf, mocker):
    user = factories.UserFactory.build()
    path = urls.reverse(
        "recipe_tag_update_for_recipe", kwargs={"tag_id": 1, "recipe_id": 1}
    )
    request = api_rf.post(path)
    authenticate(request, user)

    def mock_get_object_or_404(*args, **kwargs):
        if args[0] == models.Recipe:
            raise http.Http404()

    mocker.patch(
        "main.views.shortcuts.get_object_or_404",
        mock_get_object_or_404,
    )

    response = views.recipe_tag_update_for_recipe(request, 1, 1)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_updating_with_invalid_data(api_rf, mocker):
    user = factories.UserFactory.build()
    recipe_tag = factories.RecipeTagFactory.build(id=1)
    recipe = factories.RecipeFactory.build(id=1)

    def mock_get_object_or_404(*args, **kwargs):
        return recipe_tag if args[0] == models.RecipeTag else recipe

    mocker.patch("main.views.shortcuts.get_object_or_404", mock_get_object_or_404)

    request = api_rf.post(
        urls.reverse(
            "recipe_tag_update_for_recipe",
            kwargs={"recipe_id": recipe.id, "tag_id": recipe_tag.id},
        ),
        {},
    )

    authenticate(request, user)

    response = views.recipe_tag_update_for_recipe(request, recipe_tag.id, recipe.id)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    assert len(response.data["errors"]) > 0
    assert len(response.data["message"]) > 0


@pytest.mark.django_db
def test_updating_successfully(api_rf, mocker):
    user = factories.UserFactory.create()
    recipe = factories.RecipeFactory.create(user=user)
    recipe_tag = factories.RecipeTagFactory.create(name="OldTestTag", user=user)
    recipe.recipe_tags.add(recipe_tag)

    request = api_rf.post(
        urls.reverse(
            "recipe_tag_update_for_recipe",
            kwargs={"tag_id": recipe_tag.id, "recipe_id": recipe.id},
        ),
        {"name": "NewTestTag"},
    )

    authenticate(request, user)

    response = views.recipe_tag_update_for_recipe(request, recipe_tag.id, recipe.id)
    assert response.status_code == status.HTTP_204_NO_CONTENT

    recipe_tag.refresh_from_db()
    recipe.refresh_from_db()
    recipe_tags = recipe.recipe_tags.all()

    # Old recipe tag was dissociated from recipe.
    assert recipe_tag not in recipe_tags

    # New recipe tag was created and associated with recipe.
    assert len(recipe_tags) == 1
    assert recipe_tags[0].name == "NewTestTag"
