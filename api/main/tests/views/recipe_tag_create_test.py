from django import http, urls
from rest_framework import permissions, status, test

from main import views
from main.tests import factories
from main.tests.support import drf_view_helpers as dvh


def test_http_method_names():
    assert dvh.has_http_method_names(views.recipe_tag_create, ["options", "post"])


def test_permission_classes():
    permission_classes = [permissions.IsAuthenticated]
    assert dvh.has_permission_classes(views.recipe_tag_create, permission_classes)


def test_recipe_not_found(api_rf, mocker):
    path = urls.reverse("recipe_tag_create", kwargs={"recipe_id": 1})
    request = api_rf.post(path, {"name": "TestTag"})
    user = factories.UserFactory.build()
    test.force_authenticate(request, user=user)
    request.user = user
    mocker.patch(
        "main.views.shortcuts.get_object_or_404",
        autospec=True,
        side_effect=http.Http404,
    )
    response = views.recipe_tag_create(request, 1)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_invalid_request_data(api_rf, mocker):
    user = factories.UserFactory.build()
    recipe = factories.RecipeFactory.build(id=1, user=user)
    path = urls.reverse("recipe_tag_create", kwargs={"recipe_id": recipe.id})
    request = api_rf.post(path, {})
    test.force_authenticate(request, user=user)
    request.user = user
    mocker.patch(
        "main.views.shortcuts.get_object_or_404", autospec=True, return_value=recipe
    )
    response = views.recipe_tag_create(request, recipe.id)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    assert len(response.data["errors"]) > 0
    assert len(response.data["message"]) > 0


def test_creating_recipe_tag_successfully(api_rf, mocker):
    user = factories.UserFactory.build()
    recipe = factories.RecipeFactory.build(id=1, user=user)
    data = {"name": "TestTag"}
    recipe_tag = factories.RecipeTagFactory.build(recipe=recipe, **data)
    path = urls.reverse("recipe_tag_create", kwargs={"recipe_id": recipe.id})
    request = api_rf.post(path, data)
    test.force_authenticate(request, user=user)
    mocker.patch(
        "main.views.shortcuts.get_object_or_404", autospec=True, return_value=recipe
    )
    arts = mocker.patch(
        "main.views.serializers.RecipeTagCreateSerializer", autospec=True
    ).return_value
    arts.is_valid.return_value = True
    arts.save.return_value = recipe_tag
    response = views.recipe_tag_create(request, recipe.id)
    assert response.status_code == status.HTTP_201_CREATED
    assert "data" in response.data
    arts.save.assert_called_with(recipe=recipe)
