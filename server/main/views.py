import datetime
import logging
import zoneinfo

from django import shortcuts
from django.conf import settings
from django.contrib import auth
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.views.decorators import csrf
from rest_framework import decorators as rf_decorators
from rest_framework import permissions, response, status

from main import client, models, serializers, tasks

logger = logging.getLogger(__name__)


@rf_decorators.api_view(http_method_names=["POST"])
@rf_decorators.permission_classes([permissions.IsAuthenticated])
def create_recipe(request):
    serializer = serializers.CreateRecipeSerializer(data=request.data)

    if not serializer.is_valid():
        return response.Response(
            {
                "errors": serializer.errors,
                "message": _("The information you provided was invalid."),
            },
            status=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )

    recipe = serializer.save(user=request.user)
    return response.Response(
        {"data": {"id": recipe.id}}, status=status.HTTP_201_CREATED
    )


@rf_decorators.api_view(http_method_names=["POST"])
@rf_decorators.permission_classes([permissions.IsAuthenticated])
def create_recipe_time(request, recipe_id):
    recipe = shortcuts.get_object_or_404(models.Recipe, pk=recipe_id, user=request.user)

    # Eliminate fields with an empty string (e.g. unset <select> field).
    pruned_data = {k: v for k, v in request.data.items() if v}

    serializer = serializers.CreateRecipeTimeSerializer(data=pruned_data)

    # If "time_type" is invalid (field), units won't be validated (object).
    if not serializer.is_valid():
        return response.Response(
            {
                "errors": serializer.errors,
                "message": _("The information you provided was invalid."),
            },
            status=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )

    serializer.save(recipe=recipe)
    return response.Response({"data": serializer.data}, status=status.HTTP_201_CREATED)


@csrf.ensure_csrf_cookie
@rf_decorators.api_view(http_method_names=["GET"])
def csrf_token(request):
    return response.Response(status=status.HTTP_204_NO_CONTENT)


@rf_decorators.api_view(http_method_names=["POST"])
@rf_decorators.permission_classes([permissions.IsAuthenticated])
def delete_account(request):
    serializer = serializers.DeleteAccountSerializer(data=request.data)

    if not serializer.is_valid():
        logger.warning(
            "account deletion failed with invalid request data for user ID %(user_id)s",
            {"user_id": request.user.id},
        )

        return response.Response(
            {
                "errors": serializer.errors,
                "message": _("The information you provided was invalid."),
            },
            status=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )

    password = serializer.validated_data["password"]

    logger.info(
        "checking password for user ID %(user_id)s", {"user_id": request.user.id}
    )

    if not request.user.check_password(password):
        logger.error(
            "invalid password given for user ID %(user_id)s",
            {"user_id": request.user.id},
        )
        return response.Response(
            {"message": _("Invalid password.")},
            status=status.HTTP_403_FORBIDDEN,
        )

    logger.info(
        "deleting account for user ID %(user_id)s, username %(username)s",
        {"user_id": request.user.id, "username": request.user.username},
    )
    request.user.delete()
    auth.logout(request)
    return response.Response(status=status.HTTP_204_NO_CONTENT)


@rf_decorators.api_view(http_method_names=["POST"])
def login(request):
    username = request.data.get("username")
    logger.info("attempting login for username %(username)s", {"username": username})
    serializer = serializers.LoginSerializer(data=request.data)

    if not serializer.is_valid():
        logger.warning(
            "login failed with invalid request data for username %(username)s",
            {"username": username},
        )

        return response.Response(
            {
                "errors": serializer.errors,
                "message": _("The information you provided was invalid."),
            },
            status=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )

    # Authentication will fail if user isn't active.
    user = auth.authenticate(
        request,
        password=serializer.validated_data["password"],
        username=serializer.validated_data["username"],
    )

    if user is None:
        logger.warning(
            "login failed authentication check for username %(username)s",
            {"username": username},
        )

        return response.Response(
            {
                "message": _(
                    "We couldn't authentication you. Your username or"
                    " password might be wrong, or there might be an"
                    " issue with your account."
                )
            },
            status=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )

    logger.info("login succeeded for username %(username)s", {"username": username})
    auth.login(request, user)
    return response.Response(status=status.HTTP_204_NO_CONTENT)


@rf_decorators.api_view(http_method_names=["POST"])
@rf_decorators.permission_classes([permissions.IsAuthenticated])
def logout(request):
    auth.logout(request)
    return response.Response(status=status.HTTP_204_NO_CONTENT)


@rf_decorators.api_view(http_method_names=["GET"])
@rf_decorators.permission_classes([permissions.IsAuthenticated])
def recipe(request, recipe_id):
    recipe = shortcuts.get_object_or_404(models.Recipe, pk=recipe_id, user=request.user)
    serializer = serializers.RecipeSerializer(recipe)
    return response.Response({"data": serializer.data})


@rf_decorators.api_view(http_method_names=["POST"])
def signup(request):
    serializer = serializers.UserSerializer(data=request.data)

    if not serializer.is_valid():
        return response.Response(
            {
                "errors": serializer.errors,
                "message": _("The information you provided was invalid."),
            },
            status=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )

    user = serializer.save()

    token = models.Token.objects.create(
        category=models.Token.EMAIL_CONFIRMATION,
        expiration=timezone.now() + datetime.timedelta(hours=24),
        user=user,
    )

    site_uri = client.urls["home"]
    confirmation_uri = client.urls["signup_confirmation"].format(token=token.token)

    logger.info(
        "dispatching task send_signup_confirmation for user ID %(user_id)s",
        {"user_id": user.id},
    )

    tasks.send_signup_confirmation.delay(user.id, site_uri, confirmation_uri)

    return response.Response(
        {
            "data": {k: v for (k, v) in serializer.data.items() if k != "password"},
            "message": _("You were signed up successfully."),
        },
        status=status.HTTP_201_CREATED,
    )


@rf_decorators.api_view(http_method_names=["POST"])
def signup_confirmation(request):
    serializer = serializers.SignupConfirmationSerializer(data=request.data)

    if not serializer.is_valid():
        return response.Response(
            {
                "errors": serializer.errors,
                "message": _("The information you provided was invalid."),
            },
            status=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )

    try:
        token = models.Token.objects.get(token=serializer.data["token"])
    except models.Token.DoesNotExist:
        return response.Response(
            {"message": _("The confirmation ID you provided was invalid.")},
            status=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )

    now = datetime.datetime.now().replace(tzinfo=zoneinfo.ZoneInfo(settings.TIME_ZONE))

    if token.expiration < now:
        token.delete()

        return response.Response(
            {"message": _("The confirmation ID you provided was expired.")},
            status=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )

    user = token.user
    token.delete()
    user.email_confirmed_datetime = now
    user.is_active = True
    user.save()
    logger.info("set user with ID %(user_id)s to active", {"user_id": user.id})

    return response.Response(
        {"message": _("Your signup was successfully confirmed.")},
        status=status.HTTP_200_OK,
    )


@rf_decorators.api_view(http_method_names=["POST"])
@rf_decorators.permission_classes([permissions.IsAuthenticated])
def update_recipe_title(request, recipe_id):
    recipe = shortcuts.get_object_or_404(models.Recipe, pk=recipe_id, user=request.user)
    serializer = serializers.UpdateRecipeTitleSerializer(
        data=request.data, instance=recipe
    )

    if not serializer.is_valid():
        return response.Response(
            {
                "errors": serializer.errors,
                "message": _("The information you provided was invalid."),
            },
            status=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )

    recipe = serializer.save()
    return response.Response(status=status.HTTP_204_NO_CONTENT)
