import logging

from django.contrib import auth
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers, validators

from main import models

logger = logging.getLogger(__name__)
User = auth.get_user_model()


class AccountDestroySerializer(serializers.Serializer):
    password = serializers.CharField(
        max_length=User._meta.get_field("password").max_length, required=True
    )


class CreateRecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Recipe
        fields = ("title",)


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


class RecipeTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.RecipeTag
        fields = ("id", "name")


class RecipeTagCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.RecipeTag
        fields = ("id", "name")


class RecipeTimeSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.RecipeTime
        fields = ("days", "hours", "id", "minutes", "time_type")


class RecipeTimeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.RecipeTime
        fields = ("days", "hours", "id", "minutes", "time_type")

    def validate(self, data):
        units = ["days", "hours", "minutes"]
        error = _("At least one unit is required.")
        if not any([data.get(u) for u in units]):
            raise serializers.ValidationError({u: error for u in units})
        return data


class RecipeSerializer(serializers.ModelSerializer):
    recipe_tags = RecipeTagSerializer(many=True, required=False)
    recipe_times = RecipeTimeSerializer(many=True, required=False)

    class Meta:
        model = models.Recipe
        fields = ("id", "recipe_tags", "recipe_times", "title")


class RecipesSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Recipe
        fields = ("id", "title")


class UpdateRecipeTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.RecipeTag
        fields = ("name",)


class UpdateRecipeTitleSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Recipe
        fields = ("title",)


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
