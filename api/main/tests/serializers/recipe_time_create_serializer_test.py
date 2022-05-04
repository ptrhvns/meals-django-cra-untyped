from main import serializers


def test_validate_success():
    serializer = serializers.RecipeTimeCreateSerializer(
        data={"minutes": "1", "time_type": "Cook"}
    )
    assert serializer.is_valid()


def test_validate_requires_one_unit():
    serializer = serializers.RecipeTimeCreateSerializer(data={"time_type": "Cook"})
    assert not serializer.is_valid()
    for unit in ["days", "hours", "minutes"]:
        assert unit in serializer.errors
