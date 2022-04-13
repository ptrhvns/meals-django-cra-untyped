import pytest


@pytest.fixture
def api_rf():
    from rest_framework import test

    return test.APIRequestFactory()
