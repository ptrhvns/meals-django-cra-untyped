from django import urls
from rest_framework import permissions, status, test

from main import views
from main.tests import factories
from main.tests.support import drf_view_helpers as dvh


def test_http_method_names():
    assert dvh.has_http_method_names(views.create_recipe, ["options", "post"])


def test_permission_classes():
    permission_classes = [permissions.IsAuthenticated]
    assert dvh.has_permission_classes(views.create_recipe, permission_classes)


def test_invalid_request_data(api_rf):
    request = api_rf.post(urls.reverse("create_recipe"), {})
    user = factories.UserFactory.build()
    test.force_authenticate(request, user=user)
    response = views.create_recipe(request)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    assert len(response.data["errors"]) > 0
    assert len(response.data["message"]) > 0


def test_creating_recipe_successfully(api_rf, mocker):
    user = factories.UserFactory.build()
    recipe = factories.RecipeFactory.build(id=777, user=user)
    rs_instance = mocker.patch(
        "main.views.serializers.CreateRecipeSerializer", autospec=True
    ).return_value
    rs_instance.is_valid.return_value = True
    rs_instance.save.return_value = recipe
    request = api_rf.post(urls.reverse("create_recipe"), {"title": "Test Recipe"})
    test.force_authenticate(request, user=user)
    request.user = user
    response = views.create_recipe(request)
    assert response.status_code == status.HTTP_201_CREATED
    rs_instance.save.assert_called_with(user=user)
