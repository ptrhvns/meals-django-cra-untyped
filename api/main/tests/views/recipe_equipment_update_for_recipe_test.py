import pytest
from django import http, urls
from rest_framework import permissions, status

from main import models, views
from main.tests import factories
from main.tests.support import drf_view_helpers as dvh
from main.tests.support.request_helpers import authenticate


def test_http_method_names():
    assert dvh.has_http_method_names(
        views.recipe_equipment_update_for_recipe, ["options", "post"]
    )


def test_permission_classes():
    permission_classes = [permissions.IsAuthenticated]
    assert dvh.has_permission_classes(
        views.recipe_equipment_update_for_recipe, permission_classes
    )


def test_recipe_equipment_not_found(api_rf, mocker):
    path = urls.reverse(
        "recipe_equipment_update_for_recipe", kwargs={"equipment_id": 1, "recipe_id": 1}
    )
    request = api_rf.post(path)
    user = factories.UserFactory.build()
    authenticate(request, user)

    def mock_get_object_or_404(*args, **kwargs):
        if args[0] == models.RecipeEquipment:
            raise http.Http404()

    mocker.patch(
        "main.views.shortcuts.get_object_or_404",
        mock_get_object_or_404,
    )

    response = views.recipe_equipment_update_for_recipe(request, 1, 1)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_recipe_not_found(api_rf, mocker):
    user = factories.UserFactory.build()
    path = urls.reverse(
        "recipe_equipment_update_for_recipe", kwargs={"equipment_id": 1, "recipe_id": 1}
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

    response = views.recipe_equipment_update_for_recipe(request, 1, 1)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_updating_with_invalid_data(api_rf, mocker):
    user = factories.UserFactory.build()
    recipe_equipment = factories.RecipeEquipmentFactory.build(id=1)
    recipe = factories.RecipeFactory.build(id=1)

    def mock_get_object_or_404(*args, **kwargs):
        return recipe_equipment if args[0] == models.RecipeEquipment else recipe

    mocker.patch("main.views.shortcuts.get_object_or_404", mock_get_object_or_404)

    request = api_rf.post(
        urls.reverse(
            "recipe_equipment_update_for_recipe",
            kwargs={"recipe_id": recipe.id, "equipment_id": recipe_equipment.id},
        ),
        {},
    )

    authenticate(request, user)

    response = views.recipe_equipment_update_for_recipe(
        request, recipe_equipment.id, recipe.id
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    assert len(response.data["errors"]) > 0
    assert len(response.data["message"]) > 0


@pytest.mark.django_db
def test_updating_successfully(api_rf, mocker):
    user = factories.UserFactory.create()
    recipe = factories.RecipeFactory.create(user=user)
    recipe_equipment = factories.RecipeEquipmentFactory.create(
        description="Old test equipment", user=user
    )
    recipe.recipe_equipment.add(recipe_equipment)

    request = api_rf.post(
        urls.reverse(
            "recipe_equipment_update_for_recipe",
            kwargs={"equipment_id": recipe_equipment.id, "recipe_id": recipe.id},
        ),
        {"description": "New test equipment"},
    )

    authenticate(request, user)

    response = views.recipe_equipment_update_for_recipe(
        request, recipe_equipment.id, recipe.id
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT

    recipe_equipment.refresh_from_db()
    recipe.refresh_from_db()
    recipe_equipment = recipe.recipe_equipment.all()

    # Old recipe equipment was dissociated from recipe.
    assert recipe_equipment not in recipe_equipment

    # New recipe equipment was created and associated with recipe.
    assert len(recipe_equipment) == 1
    assert recipe_equipment[0].description == "New test equipment"
