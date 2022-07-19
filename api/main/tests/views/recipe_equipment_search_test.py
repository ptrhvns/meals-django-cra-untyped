import pytest
from django import urls
from rest_framework import permissions, status

from main import models, views
from main.tests import factories
from main.tests.support import drf_view_helpers as dvh
from main.tests.support import request_helpers as rh


def test_http_method_names():
    assert dvh.has_http_method_names(views.recipe_equipment_search, ["get", "options"])


def test_permission_classes():
    permission_classes = [permissions.IsAuthenticated]
    assert dvh.has_permission_classes(views.recipe_equipment_search, permission_classes)


def test_no_search_term_given(api_rf):
    url = rh.add_query_string(urls.reverse("recipe_equipment_search"), {})
    request = api_rf.get(url)
    user = factories.UserFactory.build()
    rh.authenticate(request, user)
    response = views.recipe_equipment_search(request)
    assert response.status_code == status.HTTP_200_OK
    assert response.data == {"data": {"matches": []}}


def test_no_matching_recipe_equipment_found(api_rf, mocker):
    url = rh.add_query_string(
        urls.reverse("recipe_equipment_search"), {"search_term": "Dinner"}
    )
    request = api_rf.get(url)
    user = factories.UserFactory.build()
    rh.authenticate(request, user)
    mocker.patch(
        "main.views.models.RecipeEquipment.objects.filter",
        autospec=True,
        return_value=models.RecipeEquipment.objects.none(),
    )
    response = views.recipe_equipment_search(request)
    assert response.status_code == status.HTTP_200_OK
    assert response.data == {"data": {"matches": []}}


@pytest.mark.django_db
def test_matching_recipe_equipment_found_sorted_by_length(api_rf, mocker):
    url = rh.add_query_string(
        urls.reverse("recipe_equipment_search"), {"search_term": "pan"}
    )
    request = api_rf.get(url)
    user = factories.UserFactory.create()
    rh.authenticate(request, user)
    recipe_equipment = [
        factories.RecipeEquipmentFactory.create(description="frying pan", user=user),
        factories.RecipeEquipmentFactory.create(description="sauce pan", user=user),
    ]
    response = views.recipe_equipment_search(request)
    assert response.status_code == status.HTTP_200_OK
    assert response.data == {
        "data": {
            "matches": list(
                sorted(
                    [rt.description for rt in recipe_equipment],
                    key=lambda description: len(description),
                )
            )
        }
    }
