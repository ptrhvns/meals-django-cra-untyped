from main.tests import factories


def test_str():
    description = "Test Equipment"
    recipe_equipment = factories.RecipeEquipmentFactory.build(description=description)
    assert str(recipe_equipment) == description
