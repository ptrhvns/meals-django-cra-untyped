import smtplib

import celery
from celery.utils import log
from django.conf import settings
from django.template import loader
from django.utils.translation import gettext as _

from main import models

logger = log.get_logger(__name__)


@celery.shared_task
def send_signup_confirmation(user_id, site_uri, confirmation_uri):
    _send_signup_confirmation(user_id, site_uri, confirmation_uri)


# Split this function out from celery to make testing easier.
def _send_signup_confirmation(user_id, site_uri, confirmation_uri):
    logger.info(
        "attempting to send signup confirmation email to user ID %(user_id)s",
        {"user_id": user_id},
    )

    context = {
        "confirmation_uri": confirmation_uri,
        "site_title": settings.SITE_TITLE,
        "site_uri": site_uri,
    }

    message = loader.render_to_string(
        "main/email/signup_confirmation.txt", context=context
    )

    html_message = loader.render_to_string(
        "main/email/signup_confirmation.html", context=context
    )

    try:
        user = models.User.objects.get(pk=user_id)
    except models.User.DoesNotExist:
        logger.error(
            "user ID %(user_id)s does not exist in database",
            {"user_id": user_id},
        )
        return

    try:
        user.email_user(
            _(f"Signup confirmation for {settings.SITE_TITLE}."),
            message,
            fail_silently=False,
            from_email=settings.EMAIL_ADDRESSES["support"],
            html_message=html_message,
        )
    except smtplib.SMTPException:
        logger.error(
            "failed to deliver email to user ID %(user_id)s", {"user_id": user.id}
        )
        return

    logger.info(
        "successfully sent signup confirmation email to user with ID %(user_id)s",
        {"user_id": user_id},
    )
