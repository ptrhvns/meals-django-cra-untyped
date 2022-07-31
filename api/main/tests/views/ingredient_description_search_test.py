import pytest
from django import urls
from rest_framework import permissions, status

from main import models, views
from main.tests import factories
from main.tests.support import drf_view_helpers as dvh
from main.tests.support import request_helpers as rh


def test_http_method_names():
    assert dvh.has_http_method_names(
        views.ingredient_description_search, ["get", "options"]
    )


def test_permission_classes():
    permission_classes = [permissions.IsAuthenticated]
    assert dvh.has_permission_classes(
        views.ingredient_description_search, permission_classes
    )


def test_no_search_term_given(api_rf):
    url = rh.add_query_string(urls.reverse("ingredient_description_search"), {})
    request = api_rf.get(url)
    user = factories.UserFactory.build()
    rh.authenticate(request, user)
    response = views.ingredient_description_search(request)
    assert response.status_code == status.HTTP_200_OK
    assert response.data == {"data": {"matches": []}}


def test_no_matching_ingredient_description_found(api_rf, mocker):
    url = rh.add_query_string(
        urls.reverse("ingredient_description_search"), {"search_term": "sugar"}
    )
    request = api_rf.get(url)
    user = factories.UserFactory.build()
    rh.authenticate(request, user)
    mocker.patch(
        "main.views.models.IngredientDescription.objects.filter",
        autospec=True,
        return_value=models.IngredientDescription.objects.none(),
    )
    response = views.ingredient_description_search(request)
    assert response.status_code == status.HTTP_200_OK
    assert response.data == {"data": {"matches": []}}


@pytest.mark.django_db
def test_matching_ingredient_description_found_sorted_by_length(api_rf):
    url = rh.add_query_string(
        urls.reverse("ingredient_description_search"), {"search_term": "sau"}
    )
    request = api_rf.get(url)
    user = factories.UserFactory.create()
    rh.authenticate(request, user)
    ingredient_description = [
        factories.IngredientDescriptionFactory.create(text="pork sausage", user=user),
        factories.IngredientDescriptionFactory.create(text="turkey sausage", user=user),
    ]
    response = views.ingredient_description_search(request)
    assert response.status_code == status.HTTP_200_OK
    assert response.data == {
        "data": {
            "matches": list(
                sorted(
                    [ind.text for ind in ingredient_description],
                    key=lambda text: len(text),
                )
            )
        }
    }
