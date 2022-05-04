#  from main import views
#  from main.tests.support import drf_view_helpers as dvh
#  import pytest
from django import http, urls
from rest_framework import permissions, status

from main import views
from main.tests import factories
from main.tests.support import drf_view_helpers as dvh
from main.tests.support.auth import authenticate


def test_http_method_names():
    assert dvh.has_http_method_names(views.recipe_tag, ["get", "options"])


def test_permission_classes():
    permission_classes = [permissions.IsAuthenticated]
    assert dvh.has_permission_classes(views.recipe_tag, permission_classes)


def test_recipe_tag_not_found(api_rf, mocker):
    path = urls.reverse("recipe_tag", kwargs={"tag_id": 1})
    request = api_rf.get(path)
    user = factories.UserFactory.build()
    authenticate(request, user)
    goo4 = mocker.patch("main.views.shortcuts.get_object_or_404", autospec=True)
    goo4.side_effect = http.Http404
    response = views.recipe_tag(request, 1)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_getting_recipe_tag_successfully(api_rf, mocker):
    user = factories.UserFactory.build()
    path = urls.reverse("recipe_tag", kwargs={"tag_id": 1})
    request = api_rf.get(path)
    authenticate(request, user)
    recipe = factories.RecipeFactory.build(user=user, id=1)
    recipe_tag = factories.RecipeTagFactory.build(recipe=recipe, id=1, name="TestTag")
    goo4 = mocker.patch("main.views.shortcuts.get_object_or_404", autospec=True)
    goo4.return_value = recipe_tag
    response = views.recipe_tag(request, 1)
    assert response.status_code == status.HTTP_200_OK
    assert response.data == {"data": {"id": recipe_tag.id, "name": recipe_tag.name}}
