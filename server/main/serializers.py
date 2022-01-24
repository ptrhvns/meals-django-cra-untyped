import logging

from django.contrib import auth
from rest_framework import serializers, validators

from main import models

logger = logging.getLogger(__name__)
User = auth.get_user_model()


class SignupConfirmationSerializer(serializers.ModelSerializer):
    token = serializers.CharField(max_length=256, required=True)

    class Meta:
        model = models.Token
        fields = ("token",)


class UserSerializer(serializers.ModelSerializer):
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

        logger.info(f"created new user with ID {user.id}")
        return user

    class Meta:
        model = User
        fields = ("id", "username", "email", "password")
