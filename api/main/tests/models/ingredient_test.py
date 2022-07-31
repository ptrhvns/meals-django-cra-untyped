import pytest

from main import models
from main.tests import factories


@pytest.mark.django_db
def test_str():
    user = models.User.objects.create_user(  # noqa: S106
        email="smith@example.com",
        is_active=True,
        password="alongpassword",
        username="smith",
    )
    amount = "1"
    unit = factories.IngredientUnitFactory(user=user)
    brand = factories.IngredientBrandFactory(user=user)
    description = factories.IngredientDescriptionFactory(user=user)
    ingredient = factories.IngredientFactory(
        amount=amount,
        unit=unit,
        brand=brand,
        description=description,
    )
    assert str(ingredient) == f"{amount} {unit} {brand} {description}"
