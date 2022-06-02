import pytest
from django import urls
from rest_framework import permissions, status

from main import models, views
from main.tests import factories
from main.tests.support import drf_view_helpers as dvh
from main.tests.support import request_helpers as rh


def test_http_method_names():
    assert dvh.has_http_method_names(views.recipe_tag_search, ["get", "options"])


def test_permission_classes():
    permission_classes = [permissions.IsAuthenticated]
    assert dvh.has_permission_classes(views.recipe_tag_search, permission_classes)


def test_no_search_term_given(api_rf):
    url = rh.add_query_string(urls.reverse("recipe_tag_search"), {})
    request = api_rf.get(url)
    user = factories.UserFactory.build()
    rh.authenticate(request, user)
    response = views.recipe_tag_search(request)
    assert response.status_code == status.HTTP_200_OK
    assert response.data == {"data": {"matches": []}}


def test_no_matching_recipe_tags_found(api_rf, mocker):
    url = rh.add_query_string(
        urls.reverse("recipe_tag_search"), {"search_term": "Dinner"}
    )
    request = api_rf.get(url)
    user = factories.UserFactory.build()
    rh.authenticate(request, user)
    mocker.patch(
        "main.views.models.RecipeTag.objects.filter",
        autospec=True,
        return_value=models.RecipeTag.objects.none(),
    )
    response = views.recipe_tag_search(request)
    assert response.status_code == status.HTTP_200_OK
    assert response.data == {"data": {"matches": []}}


@pytest.mark.django_db
def test_matching_recipe_tags_found_sorted_by_length(api_rf, mocker):
    url = rh.add_query_string(
        urls.reverse("recipe_tag_search"), {"search_term": "Dinner"}
    )
    request = api_rf.get(url)
    user = factories.UserFactory.create()
    rh.authenticate(request, user)
    recipe_tags = [
        factories.RecipeTagFactory.create(name="Healthy Dinner", user=user),
        factories.RecipeTagFactory.create(name="Dinner", user=user),
    ]
    response = views.recipe_tag_search(request)
    assert response.status_code == status.HTTP_200_OK
    assert response.data == {
        "data": {
            "matches": list(
                sorted([rt.name for rt in recipe_tags], key=lambda name: len(name))
            )
        }
    }
