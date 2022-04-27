from main.tests import factories


def test_str():
    name = "TestTag"
    recipe_tag = factories.RecipeTagFactory.build(name=name)
    assert str(recipe_tag) == name
