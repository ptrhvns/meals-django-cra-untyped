import celery
from celery.utils import log
from django.conf import settings
from django.core import mail
from django.template import loader
from django.utils.translation import gettext as _

from main import models

logger = log.get_logger(__name__)


@celery.shared_task
def send_signup_confirmation(user_id, site_uri, confirmation_uri):
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

    recipient_list = [models.User.objects.get(pk=user_id).email]

    logger.info(f"sending email confirmation to user ID {user_id}")

    mail.send_mail(
        fail_silently=False,
        from_email=settings.EMAIL_ADDRESSES["support"],
        html_message=html_message,
        message=message,
        recipient_list=recipient_list,
        subject=_(f"Signup confirmation for {settings.SITE_TITLE}."),
    )

    logger.info(f"email confirmation sent successfully to user ID {user_id}")
