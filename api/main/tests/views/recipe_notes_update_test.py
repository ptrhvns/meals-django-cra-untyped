from django import http, urls
from rest_framework import permissions, status

from main import views
from main.tests import factories
from main.tests.support import drf_view_helpers as dvh
from main.tests.support.request_helpers import authenticate


def test_http_method_names():
    assert dvh.has_http_method_names(views.recipe_notes_update, ["options", "post"])


def test_permission_classes():
    permission_classes = [permissions.IsAuthenticated]
    assert dvh.has_permission_classes(views.recipe_notes_update, permission_classes)


def test_recipe_not_found(api_rf, mocker):
    user = factories.UserFactory.build()
    path = urls.reverse("recipe_notes_update", kwargs={"recipe_id": 1})
    request = api_rf.post(path)
    authenticate(request, user)
    mocker.patch(
        "main.views.shortcuts.get_object_or_404",
        autospec=True,
        side_effect=http.Http404,
    )
    response = views.recipe_notes_update(request, 1)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_updating_with_invalid_data(api_rf, mocker):
    user = factories.UserFactory.build()
    recipe = factories.RecipeFactory.build(id=1, rating=5, user=user)
    mocker.patch(
        "main.views.shortcuts.get_object_or_404", autospec=True, return_value=recipe
    )
    request = api_rf.post(
        urls.reverse("recipe_notes_update", kwargs={"recipe_id": recipe.id}), {}
    )
    authenticate(request, user)
    response = views.recipe_notes_update(request, recipe.id)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    assert len(response.data["errors"]) > 0
    assert len(response.data["message"]) > 0


def test_updating_successfully(api_rf, mocker):
    user = factories.UserFactory.build()
    recipe = factories.RecipeFactory.build(id=1, rating=5, user=user)
    mocker.patch(
        "main.views.shortcuts.get_object_or_404", autospec=True, return_value=recipe
    )
    rnus_class = mocker.patch(
        "main.views.serializers.RecipeNotesUpdateSerializer", autospec=True
    )
    rnus_instance = rnus_class.return_value
    rnus_instance.is_valid.return_value = True
    request = api_rf.post(
        urls.reverse("recipe_notes_update", kwargs={"recipe_id": recipe.id}),
        {"notes": "This is a new note."},
    )
    authenticate(request, user)
    response = views.recipe_notes_update(request, recipe.id)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert rnus_instance.save.called
