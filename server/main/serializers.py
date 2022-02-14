import logging

from django.contrib import auth
from rest_framework import serializers, validators

from main import models

logger = logging.getLogger(__name__)
User = auth.get_user_model()


class DeleteAccountSerializer(serializers.Serializer):
    password = serializers.CharField(
        max_length=User._meta.get_field("password").max_length, required=True
    )


class LoginSerializer(serializers.Serializer):
    password = serializers.CharField(
        max_length=User._meta.get_field("password").max_length, required=True
    )

    username = serializers.CharField(
        max_length=User._meta.get_field("username").max_length, required=True
    )


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

        logger.info("created new user with ID %(user_id)s", {"user_id": user.id})
        return user

    class Meta:
        model = User
        fields = ("id", "username", "email", "password")
