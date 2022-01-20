import datetime
import logging

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
    user_serializer = serializers.UserSerializer(data=request.data)

    if not user_serializer.is_valid():
        return response.Response(
            {
                "errors": user_serializer.errors,
                "message": _("The information you provided was invalid."),
            },
            status=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )

    user = user_serializer.save()
    logging.info(f"signup created new user with ID {user.id}")

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
            "data": user_serializer.data,
            "message": _("You were signed up successfully."),
        },
        status=status.HTTP_201_CREATED,
    )


@rf_decorators.api_view(http_method_names=["POST"])
def signup_confirmation(request):
    # TODO implement view
    return response.Response(
        {"message": "Not implemented yet."}, status=status.HTTP_200_OK
    )
