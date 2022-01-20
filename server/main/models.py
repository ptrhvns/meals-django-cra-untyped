from django.conf import settings
from django.contrib.auth import models as auth_models
from django.contrib.auth import validators
from django.db import models as db_models
from django.utils.translation import gettext_lazy as _

from main import utils


class User(auth_models.AbstractUser):
    username_validator = validators.UnicodeUsernameValidator()

    email = db_models.EmailField(_("email address"), blank=False)

    username = db_models.CharField(
        _("username"),
        error_messages={"unique": _("That username already exists.")},
        help_text=_("At most 150 characters. Letters, numbers, @/./+/-/_."),
        max_length=150,
        unique=True,
        validators=[username_validator],
    )

    def __str__(self):
        return self.username


class TokenManager(db_models.Manager):
    def email_confirmations(self):
        return self.filter(category=self.model.EMAIL_CONFIRMATION)


class Token(db_models.Model):
    EMAIL_CONFIRMATION = "email_confirmation"
    CATEGORY_CHOICES = [(EMAIL_CONFIRMATION, "Email Confirmation")]

    category = db_models.CharField(choices=CATEGORY_CHOICES, max_length=32)
    expiration = db_models.DateTimeField()
    token = db_models.CharField(max_length=256, default=utils.build_token, unique=True)
    user = db_models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=db_models.CASCADE, related_name="tokens"
    )

    objects = TokenManager()

    def __str__(self):
        return self.token
