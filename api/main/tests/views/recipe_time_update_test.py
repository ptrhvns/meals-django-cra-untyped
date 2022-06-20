import pytest
from django import http, urls
from rest_framework import permissions, status

from main import views
from main.tests import factories
from main.tests.support import drf_view_helpers as dvh
from main.tests.support.request_helpers import authenticate


def test_http_method_names():
    assert dvh.has_http_method_names(views.recipe_time_update, ["options", "post"])


def test_permission_classes():
    permission_classes = [permissions.IsAuthenticated]
    assert dvh.has_permission_classes(views.recipe_time_update, permission_classes)


def test_recipe_time_not_found(api_rf, mocker):
    user = factories.UserFactory.build()
    path = urls.reverse("recipe_time_update", kwargs={"time_id": 1})
    request = api_rf.post(path)
    authenticate(request, user)
    mocker.patch(
        "main.views.shortcuts.get_object_or_404",
        autospec=True,
        side_effect=http.Http404,
    )
    response = views.recipe_time_update(request, 1)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_updating_with_invalid_data(api_rf, mocker):
    user = factories.UserFactory.build()
    recipe = factories.RecipeFactory.build(user=user)
    recipe_time = factories.RecipeTimeFactory.build(recipe=recipe, id=1)
    mocker.patch(
        "main.views.shortcuts.get_object_or_404",
        autospec=True,
        return_value=recipe_time,
    )
    request = api_rf.post(
        urls.reverse("recipe_time_update", kwargs={"time_id": recipe_time.id}), {}
    )
    authenticate(request, user)
    response = views.recipe_time_update(request, recipe_time.id)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    assert len(response.data["errors"]) > 0
    assert len(response.data["message"]) > 0


@pytest.mark.parametrize("days", ["", "5"])
@pytest.mark.parametrize("hours", ["", "5"])
@pytest.mark.parametrize("minutes", ["", "5"])
def test_updating_successfully(api_rf, mocker, days, hours, minutes):
    user = factories.UserFactory.build()
    recipe = factories.RecipeFactory.build(user=user)
    recipe_time = factories.RecipeTimeFactory.build(recipe=recipe, id=1)
    mocker.patch(
        "main.views.shortcuts.get_object_or_404",
        autospec=True,
        return_value=recipe_time,
    )
    rtus_class = mocker.patch(
        "main.views.serializers.RecipeTimeUpdateSerializer", autospec=True
    )
    rtus_instance = rtus_class.return_value
    rtus_instance.is_valid.return_value = True

    # Trigger empty string -> None convertion for days, hours, and minutes.
    request = api_rf.post(
        urls.reverse("recipe_time_update", kwargs={"time_id": recipe_time.id}),
        {"days": days, "hours": hours, "minutes": minutes, "note": "Test note"},
    )

    authenticate(request, user)
    response = views.recipe_time_update(request, recipe_time.id)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert rtus_instance.save.called
