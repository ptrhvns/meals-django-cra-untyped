from main.tests import factories


def test_str():
    title = "Test Recipe"
    recipe = factories.RecipeFactory.build(title=title)
    assert str(recipe) == title
