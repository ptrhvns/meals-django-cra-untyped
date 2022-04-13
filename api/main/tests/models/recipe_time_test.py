import pytest
from django.core import exceptions

from main.tests import factories


def test_str():
    recipe_time = factories.RecipeTimeFactory.build(
        time_type="Cook", days=1, hours=2, minutes=3
    )
    assert str(recipe_time) == "Cook: 1d 2h 3m"


@pytest.mark.django_db
def test_clean_raises_exception_on_missing_units():
    recipe = factories.RecipeFactory.create()
    recipe_time = factories.RecipeTimeFactory.build(
        days=None, hours=None, minutes=None, recipe=recipe
    )
    with pytest.raises(exceptions.ValidationError) as exc_info:
        recipe_time.clean()
    error = "At least one unit is required."
    error_dict = {"days": [error], "hours": [error], "minutes": [error]}
    for k, v in error_dict.items():
        assert exc_info.value.message_dict[k] == v


@pytest.mark.django_db
def test_clean_success():
    recipe = factories.RecipeFactory.create()
    recipe_time = factories.RecipeTimeFactory.build(recipe=recipe)
    try:
        recipe_time.clean()
    except exceptions.ValidationError:
        pytest.fail("Unexpected exception: ValidationError")
