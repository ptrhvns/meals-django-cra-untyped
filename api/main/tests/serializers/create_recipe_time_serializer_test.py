from main import serializers


def test_validate_success():
    serializer = serializers.CreateRecipeTimeSerializer(
        data={"minutes": "1", "time_type": "Cook"}
    )
    assert serializer.is_valid()


def test_validate_requires_one_unit():
    serializer = serializers.CreateRecipeTimeSerializer(data={"time_type": "Cook"})
    assert not serializer.is_valid()
    assert "days" in serializer.errors
    assert "hours" in serializer.errors
    assert "minutes" in serializer.errors
