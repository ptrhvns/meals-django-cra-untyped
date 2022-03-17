from django import http, urls
from rest_framework import permissions, status, test

from main import views
from main.tests import factories
from main.tests.support import drf_view_helpers as dvh


def test_http_method_names():
    assert dvh.has_http_method_names(views.update_recipe_title, ["options", "post"])


def test_permission_classes():
    permission_classes = [permissions.IsAuthenticated]
    assert dvh.has_permission_classes(views.update_recipe_title, permission_classes)


def test_updating_with_missing_recipe(api_rf, mocker):
    user = factories.UserFactory.build()
    request = api_rf.post(
        urls.reverse("update_recipe_title", kwargs={"recipe_id": 777}),
        {"title": "Test Title"},
    )
    test.force_authenticate(request, user=user)
    request.user = user
    mocker.patch(
        "django.shortcuts.get_object_or_404", autospec=True, side_effect=http.Http404
    )
    response = views.update_recipe_title(request, 777)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_updating_with_invalid_data(api_rf, mocker):
    user = factories.UserFactory.build()
    recipe = factories.RecipeFactory.build(id=777, user=user)
    mocker.patch(
        "django.shortcuts.get_object_or_404", autospec=True, return_value=recipe
    )
    request = api_rf.post(
        urls.reverse("update_recipe_title", kwargs={"recipe_id": recipe.id}), {}
    )
    test.force_authenticate(request, user=user)
    request.user = user
    response = views.update_recipe_title(request, recipe.id)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    assert len(response.data["errors"]) > 0
    assert len(response.data["message"]) > 0


def test_updating_successfully(api_rf, mocker):
    user = factories.UserFactory.build()
    recipe = factories.RecipeFactory.build(id=777, user=user)
    mocker.patch(
        "django.shortcuts.get_object_or_404", autospec=True, return_value=recipe
    )
    urts_class = mocker.patch(
        "main.serializers.UpdateRecipeTitleSerializer", autospec=True
    )
    urts_instance = urts_class.return_value
    urts_instance.is_valid.return_value = True
    request = api_rf.post(
        urls.reverse("update_recipe_title", kwargs={"recipe_id": recipe.id}),
        {"title": "Test Title"},
    )
    test.force_authenticate(request, user=user)
    request.user = user
    response = views.update_recipe_title(request, recipe.id)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    urts_instance.save.assert_called()
