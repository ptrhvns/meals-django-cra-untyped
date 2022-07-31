import pytest
from django import db, http, urls
from django.utils.translation import gettext_lazy as _
from rest_framework import permissions, status

from main import models, views
from main.tests import factories
from main.tests.support import drf_view_helpers as dvh
from main.tests.support.request_helpers import authenticate


def test_http_method_names():
    assert dvh.has_http_method_names(views.ingredient_associate, ["options", "post"])


def test_permission_classes():
    permission_classes = [permissions.IsAuthenticated]
    assert dvh.has_permission_classes(views.ingredient_associate, permission_classes)


def test_recipe_not_found(api_rf, mocker):
    path = urls.reverse("ingredient_associate", kwargs={"recipe_id": 1})
    request = api_rf.post(path, {"name": "TestIngredient"})
    user = factories.UserFactory.build()
    authenticate(request, user)
    mocker.patch(
        "main.views.shortcuts.get_object_or_404",
        autospec=True,
        side_effect=http.Http404,
    )
    response = views.ingredient_associate(request, 1)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_invalid_request_data(api_rf, mocker):
    user = factories.UserFactory.build()
    recipe = factories.RecipeFactory.build(id=1, user=user)
    path = urls.reverse("ingredient_associate", kwargs={"recipe_id": recipe.id})
    request = api_rf.post(path, {})
    authenticate(request, user)
    mocker.patch(
        "main.views.shortcuts.get_object_or_404", autospec=True, return_value=recipe
    )
    response = views.ingredient_associate(request, recipe.id)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    assert len(response.data["errors"]) > 0
    assert len(response.data["message"]) > 0


@pytest.mark.django_db
def test_creating_ingredient_and_adding_recipe_successfully(api_rf):
    user = factories.UserFactory.create()
    recipe = factories.RecipeFactory.create(user=user)
    data = {
        "amount": "1",
        "brand": "Acme",
        "description": "sugar",
        "unit": "cup",
    }
    request = api_rf.post(
        urls.reverse("ingredient_associate", kwargs={"recipe_id": recipe.id}),
        data,
    )
    authenticate(request, user)
    response = views.ingredient_associate(request, recipe.id)
    ingredient_qs = models.Ingredient.objects.filter(recipe=recipe).prefetch_related(
        "brand", "description", "recipe", "unit"
    )
    assert ingredient_qs.count() == 1
    ingredient = ingredient_qs.first()
    assert ingredient.amount == data["amount"]
    assert ingredient.brand.name == data["brand"]
    assert ingredient.description.text == data["description"]
    assert ingredient.unit.name == data["unit"]
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data == {
        "data": {
            "amount": ingredient.amount,
            "brand": ingredient.brand.name,
            "description": ingredient.description.text,
            "id": ingredient.id,
            "unit": ingredient.unit.name,
        }
    }


@pytest.mark.parametrize("excluded_data", ["amount", "brand", "unit"])
@pytest.mark.django_db
def test_missing_optional_request_data(api_rf, excluded_data):
    user = factories.UserFactory.create()
    recipe = factories.RecipeFactory.create(user=user)
    data = {"amount": "1", "brand": "Acme", "description": "sugar", "unit": "cup"}
    data = {k: v for k, v in data.items() if k != excluded_data}
    request = api_rf.post(
        urls.reverse("ingredient_associate", kwargs={"recipe_id": recipe.id}),
        data,
    )
    authenticate(request, user)
    response = views.ingredient_associate(request, recipe.id)
    assert response.status_code == status.HTTP_201_CREATED


@pytest.mark.django_db
def test_database_error_is_handled(api_rf, mocker):
    user = factories.UserFactory.create()
    recipe = factories.RecipeFactory.create(user=user)
    data = {"description": "sugar"}
    request = api_rf.post(
        urls.reverse("ingredient_associate", kwargs={"recipe_id": recipe.id}),
        data,
    )
    authenticate(request, user)
    mocker.patch(
        "main.views.models.Ingredient.objects.create",
        autospec=True,
        side_effect=db.IntegrityError,
    )
    response = views.ingredient_associate(request, recipe.id)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    assert response.data["message"] == _("Your information could not be saved.")
