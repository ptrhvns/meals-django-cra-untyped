from django import http, urls
from rest_framework import permissions, status

from main import views
from main.tests import factories
from main.tests.support import drf_view_helpers as dvh
from main.tests.support.request_helpers import authenticate


def test_http_method_names():
    assert dvh.has_http_method_names(views.recipe_notes, ["get", "options"])


def test_permission_classes():
    permission_classes = [permissions.IsAuthenticated]
    assert dvh.has_permission_classes(views.recipe_notes, permission_classes)


def test_recipe_not_found(api_rf, mocker):
    path = urls.reverse("recipe_notes", kwargs={"recipe_id": 1})
    request = api_rf.get(path)
    user = factories.UserFactory.build()
    authenticate(request, user)
    mocker.patch(
        "main.views.shortcuts.get_object_or_404",
        autospec=True,
        side_effect=http.Http404,
    )
    response = views.recipe_notes(request, 1)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_getting_recipe_notes_successfully(api_rf, mocker):
    path = urls.reverse("recipe_notes", kwargs={"recipe_id": 1})
    request = api_rf.get(path)
    user = factories.UserFactory.build()
    authenticate(request, user)
    notes = "This is a note."
    recipe = factories.RecipeFactory.build(id=1, notes=notes, user=user)
    mocker.patch(
        "main.views.shortcuts.get_object_or_404", autospec=True, return_value=recipe
    )
    response = views.recipe_notes(request, 1)
    assert response.status_code == status.HTTP_200_OK
    assert response.data == {"data": {"notes": recipe.notes}}
