from django import http, urls
from rest_framework import permissions, status

from main import views
from main.tests import factories
from main.tests.support import drf_view_helpers as dvh
from main.tests.support.request_helpers import authenticate


def test_http_method_names():
    assert dvh.has_http_method_names(views.recipe_equipment, ["get", "options"])


def test_permission_classes():
    permission_classes = [permissions.IsAuthenticated]
    assert dvh.has_permission_classes(views.recipe_equipment, permission_classes)


def test_recipe_equipment_not_found(api_rf, mocker):
    path = urls.reverse("recipe_equipment", kwargs={"equipment_id": 1})
    request = api_rf.get(path)
    user = factories.UserFactory.build()
    authenticate(request, user)
    mocker.patch(
        "main.views.shortcuts.get_object_or_404",
        autospec=True,
        side_effect=http.Http404,
    )
    response = views.recipe_equipment(request, 1)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_getting_recipe_equipment_successfully(api_rf, mocker):
    user = factories.UserFactory.build()
    path = urls.reverse("recipe_equipment", kwargs={"equipment_id": 1})
    request = api_rf.get(path)
    authenticate(request, user)
    recipe_equipment = factories.RecipeEquipmentFactory.build(
        id=1, description="Test equipment", user=user
    )
    mocker.patch(
        "main.views.shortcuts.get_object_or_404",
        autospec=True,
        return_value=recipe_equipment,
    )
    response = views.recipe_equipment(request, 1)
    assert response.status_code == status.HTTP_200_OK
    assert response.data == {
        "data": {"id": recipe_equipment.id, "description": recipe_equipment.description}
    }
