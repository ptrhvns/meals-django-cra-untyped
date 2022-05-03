from django.conf import settings
from django.contrib.auth import models as auth_models
from django.contrib.auth import validators
from django.core import exceptions
from django.db import models as db_models
from django.utils.translation import gettext_lazy as _

from main import utils


class Recipe(db_models.Model):
    title = db_models.CharField(max_length=256)
    user = db_models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=db_models.CASCADE, related_name="recipes"
    )

    def __str__(self):
        return self.title


class RecipeTag(db_models.Model):
    name = db_models.CharField(max_length=256)
    recipe = db_models.ForeignKey(
        Recipe, on_delete=db_models.CASCADE, related_name="recipe_tags"
    )

    def __str__(self):
        return self.name


class RecipeTime(db_models.Model):
    ADDITIONAL = "Additional"
    COOK = "Cook"
    PREPARATION = "Preparation"
    TIME_TYPE_CHOICES = [
        (ADDITIONAL, "Additional"),
        (COOK, "Cook"),
        (PREPARATION, "Preparation"),
    ]

    days = db_models.PositiveIntegerField(blank=True, null=True)
    hours = db_models.PositiveIntegerField(blank=True, null=True)
    minutes = db_models.PositiveIntegerField(blank=True, null=True)
    recipe = db_models.ForeignKey(
        Recipe, on_delete=db_models.CASCADE, related_name="recipe_times"
    )
    time_type = db_models.CharField(choices=TIME_TYPE_CHOICES, max_length=20)

    def __str__(self):
        d = f"{self.days}d" if self.days else None
        h = f"{self.hours}h" if self.hours else None
        m = f"{self.minutes}m" if self.minutes else None
        times = " ".join([t for t in [d, h, m] if t])
        return f"{self.time_type}: {times}"

    def clean(self):
        units = ["days", "hours", "minutes"]
        if not any([getattr(self, u) for u in units]):
            error = _("At least one unit is required.")
            raise exceptions.ValidationError({u: error for u in units})


class User(auth_models.AbstractUser):
    username_validator = validators.UnicodeUsernameValidator()
    email = db_models.EmailField(_("email address"), blank=False)
    email_confirmed_datetime = db_models.DateTimeField(blank=True, null=True)
    is_active = db_models.BooleanField(
        _("active"),
        default=False,
        help_text=_(
            "Designates whether this user should be treated as active. "
            "Unselect this instead of deleting accounts."
        ),
    )
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
        return self.filter(token_type=self.model.EMAIL_CONFIRMATION)


class Token(db_models.Model):
    EMAIL_CONFIRMATION = "email_confirmation"
    TOKEN_TYPE_CHOICES = [(EMAIL_CONFIRMATION, "Email Confirmation")]

    expiration = db_models.DateTimeField()
    token = db_models.CharField(max_length=256, default=utils.build_token, unique=True)
    token_type = db_models.CharField(choices=TOKEN_TYPE_CHOICES, max_length=32)
    user = db_models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=db_models.CASCADE, related_name="tokens"
    )

    objects = TokenManager()

    def __str__(self):
        return self.token