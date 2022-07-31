import pytest
from django import db, http, urls
from django.utils.translation import gettext_lazy as _
from rest_framework import permissions, status

from main import models, views
from main.tests import factories
from main.tests.support import drf_view_helpers as dvh
from main.tests.support.request_helpers import authenticate


def test_http_method_names():
    assert dvh.has_http_method_names(views.ingredient_update, ["options", "post"])


def test_permission_classes():
    permission_classes = [permissions.IsAuthenticated]
    assert dvh.has_permission_classes(views.ingredient_update, permission_classes)


def test_ingredient_not_found(api_rf, mocker):
    user = factories.UserFactory.build()
    path = urls.reverse("ingredient_update", kwargs={"ingredient_id": 1})
    request = api_rf.post(path)
    authenticate(request, user)
    mocker.patch(
        "main.views.shortcuts.get_object_or_404",
        autospec=True,
        side_effect=http.Http404,
    )
    response = views.ingredient_update(request, 1)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_updating_with_invalid_data(api_rf, mocker):
    user = factories.UserFactory.build()
    ingredient = factories.IngredientFactory.build(id=1)
    mocker.patch(
        "main.views.shortcuts.get_object_or_404",
        autospec=True,
        return_value=ingredient,
    )
    request = api_rf.post(
        urls.reverse("ingredient_update", kwargs={"ingredient_id": ingredient.id}),
        {},
    )
    authenticate(request, user)
    response = views.ingredient_update(request, ingredient.id)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    assert len(response.data["errors"]) > 0
    assert len(response.data["message"]) > 0


@pytest.mark.django_db
def test_updating_successfully(api_rf):
    user = factories.UserFactory.create()
    description = factories.IngredientDescriptionFactory.create(user=user)
    recipe = factories.RecipeFactory.create(user=user)
    ingredient = factories.IngredientFactory.create(
        description=description,
        recipe=recipe,
    )
    data = {
        "amount": "1",
        "brand": "Acme",
        "description": "sugar",
        "unit": "cup",
    }
    request = api_rf.post(
        urls.reverse("ingredient_update", kwargs={"ingredient_id": ingredient.id}), data
    )
    authenticate(request, user)
    response = views.ingredient_update(request, ingredient.id)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    ingredient_qs = models.Ingredient.objects.filter(recipe=recipe)
    assert ingredient_qs.count() == 1
    ingredient = ingredient_qs.first()
    assert ingredient.amount == data["amount"]
    assert ingredient.brand.name == data["brand"]
    assert ingredient.description.text == data["description"]
    assert ingredient.unit.name == data["unit"]


@pytest.mark.django_db
def test_database_error_is_handled(api_rf, mocker):
    user = factories.UserFactory.create()
    recipe = factories.RecipeFactory.create(user=user)
    ingredient = factories.IngredientFactory.create(recipe=recipe)
    request = api_rf.post(
        urls.reverse("ingredient_update", kwargs={"ingredient_id": ingredient.id}),
        {"description": "sugar"},
    )
    authenticate(request, user)
    mocker.patch(
        "main.views.models.Ingredient.save",
        autospec=True,
        side_effect=db.IntegrityError,
    )
    response = views.ingredient_update(request, ingredient.id)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    assert response.data["message"] == _("Your information could not be saved.")
