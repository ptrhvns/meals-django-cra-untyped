from django import http, urls
from rest_framework import permissions, status

from main import views
from main.tests import factories
from main.tests.support import drf_view_helpers as dvh
from main.tests.support.auth import authenticate


def test_http_method_names():
    assert dvh.has_http_method_names(views.recipe_rating_destroy, ["options", "post"])


def test_permission_classes():
    permission_classes = [permissions.IsAuthenticated]
    assert dvh.has_permission_classes(views.recipe_rating_destroy, permission_classes)


def test_recipe_rating_not_found(api_rf, mocker):
    path = urls.reverse("recipe_rating_destroy", kwargs={"recipe_id": 1})
    request = api_rf.post(path)
    user = factories.UserFactory.build()
    authenticate(request, user)
    mocker.patch(
        "main.views.shortcuts.get_object_or_404",
        autospec=True,
        side_effect=http.Http404,
    )
    response = views.recipe_rating_destroy(request, 1)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_destroying_recipe_rating_successfully(api_rf, mocker):
    path = urls.reverse("recipe_rating_destroy", kwargs={"recipe_id": 1})
    request = api_rf.post(path)
    user = factories.UserFactory.build()
    authenticate(request, user)
    recipe = factories.RecipeFactory.build(id=1, rating=5, user=user)
    recipe_save_mock = mocker.patch.object(recipe, "save", autospec=True)
    mocker.patch(
        "main.views.shortcuts.get_object_or_404", autospec=True, return_value=recipe
    )
    response = views.recipe_rating_destroy(request, 1)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert recipe.rating is None
    assert recipe_save_mock.called
