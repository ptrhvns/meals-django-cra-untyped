import pytest
from django import urls
from rest_framework import permissions, status

from main import models, views
from main.tests import factories
from main.tests.support import drf_view_helpers as dvh
from main.tests.support import request_helpers as rh


def test_http_method_names():
    assert dvh.has_http_method_names(views.ingredient_brand_search, ["get", "options"])


def test_permission_classes():
    permission_classes = [permissions.IsAuthenticated]
    assert dvh.has_permission_classes(views.ingredient_brand_search, permission_classes)


def test_no_search_term_given(api_rf):
    url = rh.add_query_string(urls.reverse("ingredient_brand_search"), {})
    request = api_rf.get(url)
    user = factories.UserFactory.build()
    rh.authenticate(request, user)
    response = views.ingredient_brand_search(request)
    assert response.status_code == status.HTTP_200_OK
    assert response.data == {"data": {"matches": []}}


def test_no_matching_ingredient_brand_found(api_rf, mocker):
    url = rh.add_query_string(
        urls.reverse("ingredient_brand_search"), {"search_term": "Acme"}
    )
    request = api_rf.get(url)
    user = factories.UserFactory.build()
    rh.authenticate(request, user)
    mocker.patch(
        "main.views.models.IngredientBrand.objects.filter",
        autospec=True,
        return_value=models.IngredientBrand.objects.none(),
    )
    response = views.ingredient_brand_search(request)
    assert response.status_code == status.HTTP_200_OK
    assert response.data == {"data": {"matches": []}}


@pytest.mark.django_db
def test_matching_ingredient_brand_found_sorted_by_length(api_rf):
    url = rh.add_query_string(
        urls.reverse("ingredient_brand_search"), {"search_term": "Acm"}
    )
    request = api_rf.get(url)
    user = factories.UserFactory.create()
    rh.authenticate(request, user)
    ingredient_brand = [
        factories.IngredientBrandFactory.create(name="Acme", user=user),
        factories.IngredientBrandFactory.create(name="Acmiest", user=user),
    ]
    response = views.ingredient_brand_search(request)
    assert response.status_code == status.HTTP_200_OK
    assert response.data == {
        "data": {
            "matches": list(
                sorted(
                    [ib.name for ib in ingredient_brand],
                    key=lambda name: len(name),
                )
            )
        }
    }
