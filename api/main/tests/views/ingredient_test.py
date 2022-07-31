from django import http, urls
from rest_framework import permissions, status

from main import views
from main.tests import factories
from main.tests.support import drf_view_helpers as dvh
from main.tests.support.request_helpers import authenticate


def test_http_method_names():
    assert dvh.has_http_method_names(views.ingredient, ["get", "options"])


def test_permission_classes():
    permission_classes = [permissions.IsAuthenticated]
    assert dvh.has_permission_classes(views.ingredient, permission_classes)


def test_ingredient_not_found(api_rf, mocker):
    path = urls.reverse("ingredient", kwargs={"ingredient_id": 1})
    request = api_rf.get(path)
    user = factories.UserFactory.build()
    authenticate(request, user)
    mocker.patch(
        "main.views.shortcuts.get_object_or_404",
        autospec=True,
        side_effect=http.Http404,
    )
    response = views.ingredient(request, 1)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_getting_ingredient_successfully(api_rf, mocker):
    user = factories.UserFactory.build()
    path = urls.reverse("ingredient", kwargs={"ingredient_id": 1})
    request = api_rf.get(path)
    authenticate(request, user)
    brand = factories.IngredientBrandFactory.build(user=user)
    description = factories.IngredientDescriptionFactory.build(user=user)
    recipe = factories.RecipeFactory.build(user=user)
    unit = factories.IngredientUnitFactory.build(user=user)
    ingredient = factories.IngredientFactory.build(
        amount="4",
        brand=brand,
        description=description,
        id=1,
        recipe=recipe,
        unit=unit,
    )
    mocker.patch(
        "main.views.shortcuts.get_object_or_404",
        autospec=True,
        return_value=ingredient,
    )
    response = views.ingredient(request, 1)
    assert response.status_code == status.HTTP_200_OK
    assert response.data["data"]["amount"] == ingredient.amount
    assert response.data["data"]["unit"]["name"] == unit.name
    assert response.data["data"]["brand"]["name"] == brand.name
    assert response.data["data"]["description"]["text"] == description.text
