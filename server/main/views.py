import datetime
import logging
import zoneinfo

import pytz
from django.conf import settings
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.views.decorators import csrf
from rest_framework import decorators as rf_decorators
from rest_framework import response, status

from main import client, models, serializers, tasks

logger = logging.getLogger(__name__)


@csrf.ensure_csrf_cookie
@rf_decorators.api_view(http_method_names=["GET"])
def csrf_token_cookie(request):
    return response.Response(status=status.HTTP_204_NO_CONTENT)


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

    logger.info(f"dispatching task send_signup_confirmation for user ID {user.id}")
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
    user.is_active = True
    user.save()
    logger.info(f"set user with ID {user.id} to active")

    return response.Response(
        {"message": _("Your signup was successfully confirmed.")},
        status=status.HTTP_200_OK,
    )
