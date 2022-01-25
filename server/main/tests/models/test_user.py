from main.tests import factories


def test_str():
    username = "example"
    user = factories.UserFactory.build(username=username)
    assert str(user) == username
