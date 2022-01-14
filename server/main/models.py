from django.contrib.auth import models as auth_models
from django.contrib.auth import validators
from django.db import models as db_models
from django.utils.translation import gettext_lazy as _


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
