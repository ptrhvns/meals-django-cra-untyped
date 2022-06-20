from django import http, urls
from rest_framework import permissions, status

from main import models, views
from main.tests import factories
from main.tests.support import drf_view_helpers as dvh
from main.tests.support.request_helpers import authenticate


def test_http_method_names():
    assert dvh.has_http_method_names(views.recipe_tag_dissociate, ["options", "post"])


def test_permission_classes():
    permission_classes = [permissions.IsAuthenticated]
    assert dvh.has_permission_classes(views.recipe_tag_dissociate, permission_classes)


def test_recipe_not_found(api_rf, mocker):
    user = factories.UserFactory.build()
    path = urls.reverse("recipe_tag_dissociate", kwargs={"tag_id": 1, "recipe_id": 1})
    request = api_rf.post(path)
    authenticate(request, user)

    def mock_get_object_or_404(*args, **kwargs):
        if args[0] == models.Recipe:
            raise http.Http404()

    mocker.patch(
        "main.views.shortcuts.get_object_or_404",
        mock_get_object_or_404,
    )

    response = views.recipe_tag_dissociate(request, 1, 1)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_recipe_tag_not_found(api_rf, mocker):
    path = urls.reverse("recipe_tag_dissociate", kwargs={"tag_id": 1, "recipe_id": 1})
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

    response = views.recipe_tag_dissociate(request, 1, 1)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_successfully_dissociating_recipe_tag_from_recipe(api_rf, mocker):
    path = urls.reverse("recipe_tag_dissociate", kwargs={"tag_id": 1, "recipe_id": 1})
    request = api_rf.post(path)
    user = factories.UserFactory.build()
    authenticate(request, user)
    recipe_tag = factories.RecipeTagFactory.build()
    recipe = mocker.MagicMock()

    def mock_get_object_or_404(*args, **kwargs):
        return recipe if args[0] == models.Recipe else recipe_tag

    mocker.patch(
        "main.views.shortcuts.get_object_or_404",
        mock_get_object_or_404,
    )

    response = views.recipe_tag_dissociate(request, 1, 1)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert recipe.recipe_tags.remove.call_args.args[0] == recipe_tag
