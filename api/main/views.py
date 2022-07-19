import datetime
import logging
import zoneinfo

from django import http, shortcuts
from django.conf import settings
from django.contrib import auth
from django.db import transaction
from django.db.models import functions
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.views.decorators import csrf
from rest_framework import decorators as rf_decorators
from rest_framework import permissions, response, status

from main import client, models, serializers, tasks

logger = logging.getLogger(__name__)


def bad_request(request, exception=None):
    return http.JsonResponse(
        {"message": "Your request was invalid."}, status=status.HTTP_400_BAD_REQUEST
    )


def forbidden(request, exception=None):
    return http.JsonResponse(
        {"message": "Your request was not authorized."},
        status=status.HTTP_403_FORBIDDEN,
    )


def not_found(request, exception=None):
    return http.JsonResponse(
        {"message": "A resource matching your request was not found."},
        status=status.HTTP_404_NOT_FOUND,
    )


def internal_server_error(request, exception=None):
    return http.JsonResponse(
        {"message": "An error occurred while processing your request."},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )


@rf_decorators.api_view(http_method_names=["POST"])
@rf_decorators.permission_classes([permissions.IsAuthenticated])
def account_destroy(request):
    serializer = serializers.AccountDestroySerializer(data=request.data)

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


@csrf.ensure_csrf_cookie
@rf_decorators.api_view(http_method_names=["GET"])
def csrf_token(request):
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

    if request.data.get("remember_me"):
        request.session.set_expiry(settings.SESSION_COOKIE_AGE)
    else:
        request.session.set_expiry(0)

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
@rf_decorators.permission_classes([permissions.IsAuthenticated])
def recipe_create(request):
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


@rf_decorators.api_view(http_method_names=["GET"])
@rf_decorators.permission_classes([permissions.IsAuthenticated])
def recipe_equipment(request, equipment_id):
    recipe_equipment = shortcuts.get_object_or_404(
        models.RecipeEquipment, pk=equipment_id, user=request.user
    )
    serializer = serializers.RecipeEquipmentSerializer(recipe_equipment)
    return response.Response({"data": serializer.data})


@rf_decorators.api_view(http_method_names=["POST"])
@rf_decorators.permission_classes([permissions.IsAuthenticated])
def recipe_equipment_associate(request, recipe_id):
    recipe = shortcuts.get_object_or_404(models.Recipe, pk=recipe_id, user=request.user)
    serializer = serializers.RecipeEquipmentAssocateSerializer(data=request.data)

    if not serializer.is_valid():
        return response.Response(
            {
                "errors": serializer.errors,
                "message": _("The information you provided was invalid."),
            },
            status=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )

    recipe_equipment = models.RecipeEquipment.objects.filter(
        description__iexact=serializer.validated_data["description"], user=request.user
    ).first()

    created = False

    if not recipe_equipment:
        recipe_equipment = serializer.save(user=request.user)
        created = True

    if not recipe_equipment.recipes.contains(recipe):
        recipe_equipment.recipes.add(recipe)

    serializer = serializers.RecipeEquipmentAssocateSerializer(recipe_equipment)

    return response.Response(
        {"data": serializer.data},
        status=(status.HTTP_201_CREATED if created else status.HTTP_200_OK),
    )


@rf_decorators.api_view(http_method_names=["POST"])
@rf_decorators.permission_classes([permissions.IsAuthenticated])
def recipe_equipment_destroy(request, equipment_id):
    recipe_equipment = shortcuts.get_object_or_404(
        models.RecipeEquipment, pk=equipment_id, user=request.user
    )
    recipe_equipment.delete()
    return response.Response(status=status.HTTP_204_NO_CONTENT)


@rf_decorators.api_view(http_method_names=["POST"])
@rf_decorators.permission_classes([permissions.IsAuthenticated])
def recipe_equipment_dissociate(request, equipment_id, recipe_id):
    recipe = shortcuts.get_object_or_404(models.Recipe, pk=recipe_id, user=request.user)
    recipe_equipment = shortcuts.get_object_or_404(
        models.RecipeEquipment, pk=equipment_id, recipes=recipe, user=request.user
    )
    recipe.recipe_equipment.remove(recipe_equipment)
    return response.Response(status=status.HTTP_204_NO_CONTENT)


MAX_RECIPE_EQUIPMENT_IN_SEARCH = 10


@rf_decorators.api_view(http_method_names=["GET"])
@rf_decorators.permission_classes([permissions.IsAuthenticated])
def recipe_equipment_search(request):
    if not (search_term := request.query_params.get("search_term")):
        return response.Response({"data": {"matches": []}})

    recipe_equipment = models.RecipeEquipment.objects.filter(
        description__icontains=search_term, user=request.user
    ).order_by(functions.Length("description").asc())[:MAX_RECIPE_EQUIPMENT_IN_SEARCH]

    return response.Response(
        {"data": {"matches": [r.description for r in recipe_equipment]}}
    )


@rf_decorators.api_view(http_method_names=["POST"])
@rf_decorators.permission_classes([permissions.IsAuthenticated])
def recipe_equipment_update(request, equipment_id):
    recipe_equipment = shortcuts.get_object_or_404(
        models.RecipeEquipment, pk=equipment_id, user=request.user
    )
    serializer = serializers.RecipeEquipmentUpdateSerializer(
        data=request.data, instance=recipe_equipment
    )

    if not serializer.is_valid():
        return response.Response(
            {
                "errors": serializer.errors,
                "message": _("The information you provided was invalid."),
            },
            status=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )

    serializer.save()
    return response.Response(status=status.HTTP_204_NO_CONTENT)


@rf_decorators.api_view(http_method_names=["POST"])
@rf_decorators.permission_classes([permissions.IsAuthenticated])
def recipe_equipment_update_for_recipe(request, equipment_id, recipe_id):
    recipe_equipment = shortcuts.get_object_or_404(
        models.RecipeEquipment, pk=equipment_id, user=request.user
    )
    recipe = shortcuts.get_object_or_404(models.Recipe, pk=recipe_id, user=request.user)
    serializer = serializers.RecipeEquipmentUpdateForRecipeSerializer(data=request.data)

    if not serializer.is_valid():
        return response.Response(
            {
                "errors": serializer.errors,
                "message": _("The information you provided was invalid."),
            },
            status=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )

    with transaction.atomic():
        recipe.recipe_equipment.remove(recipe_equipment)
        recipe_equipment, was_saved = models.RecipeEquipment.objects.get_or_create(
            **serializer.validated_data, user=request.user
        )
        recipe.recipe_equipment.add(recipe_equipment)

    return response.Response(status=status.HTTP_204_NO_CONTENT)


@rf_decorators.api_view(http_method_names=["GET"])
@rf_decorators.permission_classes([permissions.IsAuthenticated])
def recipe_notes(request, recipe_id):
    recipe = shortcuts.get_object_or_404(models.Recipe, pk=recipe_id, user=request.user)
    serializer = serializers.RecipeNotesSerializer(recipe)
    return response.Response({"data": serializer.data})


@rf_decorators.api_view(http_method_names=["POST"])
@rf_decorators.permission_classes([permissions.IsAuthenticated])
def recipe_notes_destroy(request, recipe_id):
    recipe = shortcuts.get_object_or_404(models.Recipe, pk=recipe_id, user=request.user)
    recipe.notes = ""
    recipe.save()
    return response.Response(status=status.HTTP_204_NO_CONTENT)


@rf_decorators.api_view(http_method_names=["POST"])
@rf_decorators.permission_classes([permissions.IsAuthenticated])
def recipe_notes_update(request, recipe_id):
    recipe = shortcuts.get_object_or_404(models.Recipe, pk=recipe_id, user=request.user)
    serializer = serializers.RecipeNotesUpdateSerializer(
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


@rf_decorators.api_view(http_method_names=["GET"])
@rf_decorators.permission_classes([permissions.IsAuthenticated])
def recipe_rating(request, recipe_id):
    recipe = shortcuts.get_object_or_404(models.Recipe, pk=recipe_id, user=request.user)
    serializer = serializers.RecipeRatingSerializer(recipe)
    return response.Response({"data": serializer.data})


@rf_decorators.api_view(http_method_names=["POST"])
@rf_decorators.permission_classes([permissions.IsAuthenticated])
def recipe_rating_destroy(request, recipe_id):
    recipe = shortcuts.get_object_or_404(models.Recipe, pk=recipe_id, user=request.user)
    recipe.rating = None
    recipe.save()
    return response.Response(status=status.HTTP_204_NO_CONTENT)


@rf_decorators.api_view(http_method_names=["POST"])
@rf_decorators.permission_classes([permissions.IsAuthenticated])
def recipe_rating_update(request, recipe_id):
    recipe = shortcuts.get_object_or_404(models.Recipe, pk=recipe_id, user=request.user)
    serializer = serializers.RecipeRatingUpdateSerializer(
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


@rf_decorators.api_view(http_method_names=["GET"])
@rf_decorators.permission_classes([permissions.IsAuthenticated])
def recipe_servings(request, recipe_id):
    recipe = shortcuts.get_object_or_404(models.Recipe, pk=recipe_id, user=request.user)
    serializer = serializers.RecipeServingsSerializer(recipe)
    return response.Response({"data": serializer.data})


@rf_decorators.api_view(http_method_names=["POST"])
@rf_decorators.permission_classes([permissions.IsAuthenticated])
def recipe_servings_destroy(request, recipe_id):
    recipe = shortcuts.get_object_or_404(models.Recipe, pk=recipe_id, user=request.user)
    recipe.servings = None
    recipe.save()
    return response.Response(status=status.HTTP_204_NO_CONTENT)


@rf_decorators.api_view(http_method_names=["POST"])
@rf_decorators.permission_classes([permissions.IsAuthenticated])
def recipe_servings_update(request, recipe_id):
    recipe = shortcuts.get_object_or_404(models.Recipe, pk=recipe_id, user=request.user)
    serializer = serializers.RecipeServingsUpdateSerializer(
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


@rf_decorators.api_view(http_method_names=["GET"])
@rf_decorators.permission_classes([permissions.IsAuthenticated])
def recipe_tag(request, tag_id):
    recipe_tag = shortcuts.get_object_or_404(
        models.RecipeTag, pk=tag_id, user=request.user
    )
    serializer = serializers.RecipeTagSerializer(recipe_tag)
    return response.Response({"data": serializer.data})


@rf_decorators.api_view(http_method_names=["POST"])
@rf_decorators.permission_classes([permissions.IsAuthenticated])
def recipe_tag_associate(request, recipe_id):
    recipe = shortcuts.get_object_or_404(models.Recipe, pk=recipe_id, user=request.user)
    serializer = serializers.RecipeTagAssocateSerializer(data=request.data)

    if not serializer.is_valid():
        return response.Response(
            {
                "errors": serializer.errors,
                "message": _("The information you provided was invalid."),
            },
            status=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )

    recipe_tag = models.RecipeTag.objects.filter(
        name__iexact=serializer.validated_data["name"], user=request.user
    ).first()

    created = False

    if not recipe_tag:
        recipe_tag = serializer.save(user=request.user)
        created = True

    if not recipe_tag.recipes.contains(recipe):
        recipe_tag.recipes.add(recipe)

    serializer = serializers.RecipeTagAssocateSerializer(recipe_tag)

    return response.Response(
        {"data": serializer.data},
        status=(status.HTTP_201_CREATED if created else status.HTTP_200_OK),
    )


@rf_decorators.api_view(http_method_names=["POST"])
@rf_decorators.permission_classes([permissions.IsAuthenticated])
def recipe_tag_destroy(request, tag_id):
    recipe_tag = shortcuts.get_object_or_404(
        models.RecipeTag, pk=tag_id, user=request.user
    )
    recipe_tag.delete()
    return response.Response(status=status.HTTP_204_NO_CONTENT)


@rf_decorators.api_view(http_method_names=["POST"])
@rf_decorators.permission_classes([permissions.IsAuthenticated])
def recipe_tag_dissociate(request, tag_id, recipe_id):
    recipe = shortcuts.get_object_or_404(models.Recipe, pk=recipe_id, user=request.user)
    recipe_tag = shortcuts.get_object_or_404(
        models.RecipeTag, pk=tag_id, recipes=recipe, user=request.user
    )
    recipe.recipe_tags.remove(recipe_tag)
    return response.Response(status=status.HTTP_204_NO_CONTENT)


@rf_decorators.api_view(http_method_names=["POST"])
@rf_decorators.permission_classes([permissions.IsAuthenticated])
def recipe_tag_update(request, tag_id):
    recipe_tag = shortcuts.get_object_or_404(
        models.RecipeTag, pk=tag_id, user=request.user
    )
    serializer = serializers.RecipeTagUpdateSerializer(
        data=request.data, instance=recipe_tag
    )

    if not serializer.is_valid():
        return response.Response(
            {
                "errors": serializer.errors,
                "message": _("The information you provided was invalid."),
            },
            status=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )

    serializer.save()
    return response.Response(status=status.HTTP_204_NO_CONTENT)


@rf_decorators.api_view(http_method_names=["POST"])
@rf_decorators.permission_classes([permissions.IsAuthenticated])
def recipe_tag_update_for_recipe(request, tag_id, recipe_id):
    recipe_tag = shortcuts.get_object_or_404(
        models.RecipeTag, pk=tag_id, user=request.user
    )
    recipe = shortcuts.get_object_or_404(models.Recipe, pk=recipe_id, user=request.user)
    serializer = serializers.RecipeTagUpdateForRecipeSerializer(data=request.data)

    if not serializer.is_valid():
        return response.Response(
            {
                "errors": serializer.errors,
                "message": _("The information you provided was invalid."),
            },
            status=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )

    with transaction.atomic():
        recipe.recipe_tags.remove(recipe_tag)
        recipe_tag, was_saved = models.RecipeTag.objects.get_or_create(
            **serializer.validated_data, user=request.user
        )
        recipe.recipe_tags.add(recipe_tag)

    return response.Response(status=status.HTTP_204_NO_CONTENT)


MAX_RECIPE_TAGS_IN_SEARCH = 10


@rf_decorators.api_view(http_method_names=["GET"])
@rf_decorators.permission_classes([permissions.IsAuthenticated])
def recipe_tag_search(request):
    if not (search_term := request.query_params.get("search_term")):
        return response.Response({"data": {"matches": []}})

    recipe_tags = models.RecipeTag.objects.filter(
        name__icontains=search_term, user=request.user
    ).order_by(functions.Length("name").asc())[:MAX_RECIPE_TAGS_IN_SEARCH]

    return response.Response({"data": {"matches": [r.name for r in recipe_tags]}})


@rf_decorators.api_view(http_method_names=["GET"])
@rf_decorators.permission_classes([permissions.IsAuthenticated])
def recipe_time(request, time_id):
    recipe_time = shortcuts.get_object_or_404(
        models.RecipeTime, pk=time_id, recipe__user=request.user
    )
    serializer = serializers.RecipeTimeSerializer(recipe_time)
    return response.Response({"data": serializer.data})


@rf_decorators.api_view(http_method_names=["POST"])
@rf_decorators.permission_classes([permissions.IsAuthenticated])
def recipe_time_create(request, recipe_id):
    recipe = shortcuts.get_object_or_404(models.Recipe, pk=recipe_id, user=request.user)

    # Eliminate fields with an empty string (e.g. unset <select> field).
    pruned_data = {k: v for k, v in request.data.items() if v}

    serializer = serializers.RecipeTimeCreateSerializer(data=pruned_data)

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


@rf_decorators.api_view(http_method_names=["POST"])
@rf_decorators.permission_classes([permissions.IsAuthenticated])
def recipe_time_destroy(request, time_id):
    recipe_time = shortcuts.get_object_or_404(
        models.RecipeTime, pk=time_id, recipe__user=request.user
    )
    recipe_time.delete()
    return response.Response(status=status.HTTP_204_NO_CONTENT)


@rf_decorators.api_view(http_method_names=["POST"])
@rf_decorators.permission_classes([permissions.IsAuthenticated])
def recipe_time_update(request, time_id):
    recipe_time = shortcuts.get_object_or_404(
        models.RecipeTime, pk=time_id, recipe__user=request.user
    )

    # Convert unit fields with an empty string to None.
    data = request.data.copy()
    for k, v in request.data.items():
        if k in ["days", "hours", "minutes"]:
            if not v:
                data[k] = None

    serializer = serializers.RecipeTimeUpdateSerializer(data=data, instance=recipe_time)

    if not serializer.is_valid():
        return response.Response(
            {
                "errors": serializer.errors,
                "message": _("The information you provided was invalid."),
            },
            status=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )

    recipe_time = serializer.save()
    return response.Response(status=status.HTTP_204_NO_CONTENT)


@rf_decorators.api_view(http_method_names=["POST"])
@rf_decorators.permission_classes([permissions.IsAuthenticated])
def recipe_title_update(request, recipe_id):
    recipe = shortcuts.get_object_or_404(models.Recipe, pk=recipe_id, user=request.user)
    serializer = serializers.RecipeTitleUpdateSerializer(
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


@rf_decorators.api_view(http_method_names=["GET"])
@rf_decorators.permission_classes([permissions.IsAuthenticated])
def recipes(request):
    # TODO paginate recipes
    recipes = models.Recipe.objects.filter(user=request.user).all()
    serializer = serializers.RecipesSerializer(recipes, many=True)
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
        expiration=timezone.now() + datetime.timedelta(hours=24),
        token_type=models.Token.EMAIL_CONFIRMATION,
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
