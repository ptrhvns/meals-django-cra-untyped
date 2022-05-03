from django import urls
from rest_framework import permissions, status, test

from main import views
from main.tests import factories
from main.tests.support import drf_view_helpers as dvh


def test_http_method_names():
    assert dvh.has_http_method_names(views.recipe_create, ["options", "post"])


def test_permission_classes():
    permission_classes = [permissions.IsAuthenticated]
    assert dvh.has_permission_classes(views.recipe_create, permission_classes)


def test_invalid_request_data(api_rf):
    request = api_rf.post(urls.reverse("recipe_create"), {})
    user = factories.UserFactory.build()
    test.force_authenticate(request, user=user)
    response = views.recipe_create(request)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    assert len(response.data["errors"]) > 0
    assert len(response.data["message"]) > 0


def test_creating_recipe_successfully(api_rf, mocker):
    user = factories.UserFactory.build()
    recipe = factories.RecipeFactory.build(id=777, user=user)
    crs_class = mocker.patch(
        "main.views.serializers.CreateRecipeSerializer", autospec=True
    )
    crs_instance = crs_class.return_value
    crs_instance.is_valid.return_value = True
    crs_instance.save.return_value = recipe
    request = api_rf.post(urls.reverse("recipe_create"), {"title": "Test Recipe"})
    test.force_authenticate(request, user=user)
    request.user = user
    response = views.recipe_create(request)
    assert response.status_code == status.HTTP_201_CREATED
    crs_instance.save.assert_called_with(user=user)
