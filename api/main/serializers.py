import logging

from django.contrib import auth
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers, validators

from main import models

logger = logging.getLogger(__name__)
User = auth.get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "password")

    email = serializers.EmailField(
        required=True,
        validators=[validators.UniqueValidator(queryset=User.objects.all())],
    )

    username = serializers.CharField(
        validators=[validators.UniqueValidator(queryset=User.objects.all())]
    )

    password = serializers.CharField(required=True, min_length=8)

    def create(self, validated_data):
        user = User.objects.create_user(
            validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )

        logger.info("created new user with ID %(user_id)s", {"user_id": user.id})
        return user


class AccountDestroySerializer(serializers.Serializer):
    password = serializers.CharField(
        max_length=User._meta.get_field("password").max_length, required=True
    )


class CreateRecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Recipe
        fields = ("title",)


class IngredientBrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.IngredientBrand
        fields = ("id", "name")

    name = serializers.CharField(allow_blank=False, allow_null=False, max_length=256)


class IngredientDescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.IngredientDescription
        fields = ("id", "text")

    text = serializers.CharField(allow_blank=False, allow_null=False, max_length=256)


class IngredientUnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.IngredientUnit
        fields = ("id", "name")

    name = serializers.CharField(allow_blank=False, allow_null=False, max_length=256)


class IngredientUpdateSerializer(serializers.Serializer):
    amount = serializers.CharField(
        allow_blank=False,
        max_length=models.Ingredient._meta.get_field("amount").max_length,
        required=False,
    )
    brand = serializers.CharField(
        allow_blank=False,
        max_length=models.IngredientBrand._meta.get_field("name").max_length,
        required=False,
    )
    description = serializers.CharField(
        allow_blank=False,
        max_length=models.IngredientDescription._meta.get_field("text").max_length,
        required=True,
    )
    unit = serializers.CharField(
        allow_blank=False,
        max_length=models.IngredientUnit._meta.get_field("name").max_length,
        required=False,
    )


class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Ingredient
        fields = (
            "amount",
            "brand",
            "description",
            "id",
            "unit",
        )

    brand = IngredientBrandSerializer(required=False)
    description = IngredientDescriptionSerializer(required=True)
    unit = IngredientUnitSerializer(required=False)


class LoginSerializer(serializers.Serializer):
    password = serializers.CharField(
        max_length=User._meta.get_field("password").max_length, required=True
    )

    username = serializers.CharField(
        max_length=User._meta.get_field("username").max_length, required=True
    )


class SignupConfirmationSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Token
        fields = ("token",)

    token = serializers.CharField(max_length=256, required=True)


class RecipeEquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.RecipeEquipment
        fields = ("id", "description")


class RecipeEquipmentAssociateSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.RecipeEquipment
        fields = ("id", "description")


class RecipeEquipmentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.RecipeEquipment
        fields = ("description",)


class RecipeEquipmentUpdateForRecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.RecipeEquipment
        fields = ("description",)


class RecipeNotesSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Recipe
        fields = ("notes",)


class RecipeNotesUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Recipe
        fields = ("notes",)

    notes = serializers.CharField(allow_blank=True, required=True)


class RecipeRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Recipe
        fields = ("rating",)


class RecipeRatingUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Recipe
        fields = ("rating",)

    rating = serializers.IntegerField(max_value=5, min_value=1, required=True)


class RecipeServingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Recipe
        fields = ("servings",)


class RecipeServingsUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Recipe
        fields = ("servings",)

    servings = serializers.DecimalField(
        max_digits=6, decimal_places=2, coerce_to_string=False, required=True
    )


class RecipesSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Recipe
        fields = ("id", "title")


class RecipeTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.RecipeTag
        fields = ("id", "name")


class RecipeTagAssociateSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.RecipeTag
        fields = ("id", "name")


class RecipeTagUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.RecipeTag
        fields = ("name",)


class RecipeTagUpdateForRecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.RecipeTag
        fields = ("name",)


class RecipeTimeSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.RecipeTime
        fields = ("days", "hours", "id", "minutes", "note", "time_type")


class RecipeTimeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.RecipeTime
        fields = ("days", "hours", "id", "minutes", "note", "time_type")

    def validate(self, data):
        units = ["days", "hours", "minutes"]
        error = _("At least one unit is required.")
        if not any([data.get(u) for u in units]):
            raise serializers.ValidationError({u: error for u in units})
        return data


class RecipeTimeUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.RecipeTime
        fields = ("days", "hours", "minutes", "note", "time_type")

    def validate(self, data):
        units = ["days", "hours", "minutes"]
        error = _("At least one unit is required.")
        if not any([data.get(u) for u in units]):
            raise serializers.ValidationError({u: error for u in units})
        return data


class RecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Recipe
        fields = (
            "id",
            "ingredients",
            "notes",
            "rating",
            "recipe_equipment",
            "recipe_tags",
            "recipe_times",
            "servings",
            "title",
        )

    ingredients = IngredientSerializer(many=True, required=False)
    recipe_equipment = RecipeEquipmentSerializer(many=True, required=False)
    recipe_tags = RecipeTagSerializer(many=True, required=False)
    recipe_times = RecipeTimeSerializer(many=True, required=False)
    servings = serializers.DecimalField(
        max_digits=6, decimal_places=2, coerce_to_string=False, required=False
    )


class RecipeIngredientAssociateSerializer(serializers.Serializer):
    amount = serializers.CharField(
        allow_blank=False,
        max_length=models.Ingredient._meta.get_field("amount").max_length,
        required=False,
    )
    brand = serializers.CharField(
        allow_blank=False,
        max_length=models.IngredientBrand._meta.get_field("name").max_length,
        required=False,
    )
    description = serializers.CharField(
        allow_blank=False,
        max_length=models.IngredientDescription._meta.get_field("text").max_length,
        required=True,
    )
    unit = serializers.CharField(
        allow_blank=False,
        max_length=models.IngredientUnit._meta.get_field("name").max_length,
        required=False,
    )


class RecipeTitleUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Recipe
        fields = ("title",)
