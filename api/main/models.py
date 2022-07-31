from django.conf import settings
from django.contrib.auth import models as auth_models
from django.contrib.auth import validators as auth_validators
from django.core import exceptions
from django.core import validators as core_validators
from django.db import models as db_models
from django.utils.translation import gettext_lazy as _

from main import utils


class Recipe(db_models.Model):
    notes = db_models.TextField(blank=True)
    rating = db_models.PositiveSmallIntegerField(
        blank=True,
        null=True,
        validators=[
            core_validators.MinValueValidator(1),
            core_validators.MaxValueValidator(5),
        ],
    )
    recipe_equipment = db_models.ManyToManyField(
        "RecipeEquipment", related_name="recipes"
    )
    recipe_tags = db_models.ManyToManyField("RecipeTag", related_name="recipes")
    servings = db_models.DecimalField(
        blank=True,
        decimal_places=2,
        max_digits=6,
        null=True,
        validators=[core_validators.MinValueValidator(0)],
    )
    title = db_models.CharField(max_length=256)
    user = db_models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=db_models.CASCADE, related_name="recipes"
    )

    def __str__(self):
        return self.title


class RecipeEquipment(db_models.Model):
    description = db_models.CharField(max_length=256)
    user = db_models.ForeignKey(
        settings.AUTH_USER_MODEL,
        blank=False,
        null=False,
        on_delete=db_models.CASCADE,
        related_name="recipe_equipment",
    )

    class Meta:
        unique_together = ["description", "user"]

    def __str__(self):
        return self.description


class RecipeTag(db_models.Model):
    name = db_models.CharField(max_length=256)
    user = db_models.ForeignKey(
        settings.AUTH_USER_MODEL,
        blank=False,
        null=False,
        on_delete=db_models.CASCADE,
        related_name="recipe_tags",
    )

    class Meta:
        unique_together = ["name", "user"]

    def __str__(self):
        return self.name


class RecipeTime(db_models.Model):
    ADDITIONAL = "Additional"
    COOK = "Cook"
    PREPARATION = "Preparation"
    TOTAL = "Total"
    TIME_TYPE_CHOICES = [
        (ADDITIONAL, "Additional"),
        (COOK, "Cook"),
        (PREPARATION, "Preparation"),
        (TOTAL, "Total"),
    ]

    days = db_models.PositiveIntegerField(blank=True, null=True)
    hours = db_models.PositiveIntegerField(blank=True, null=True)
    minutes = db_models.PositiveIntegerField(blank=True, null=True)
    note = db_models.CharField(blank=True, default="", max_length=2**6)
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
    username_validator = auth_validators.UnicodeUsernameValidator()
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


class IngredientBrand(db_models.Model):
    name = db_models.CharField(max_length=256)
    user = db_models.ForeignKey(
        settings.AUTH_USER_MODEL,
        blank=False,
        null=False,
        on_delete=db_models.CASCADE,
        related_name="ingredient_brands",
    )

    class Meta:
        unique_together = ["name", "user"]

    def __str__(self):
        return self.name


class IngredientDescription(db_models.Model):
    text = db_models.CharField(max_length=256)
    user = db_models.ForeignKey(
        settings.AUTH_USER_MODEL,
        blank=False,
        null=False,
        on_delete=db_models.CASCADE,
        related_name="ingredient_descriptions",
    )

    class Meta:
        unique_together = ["text", "user"]

    def __str__(self):
        return self.text


class IngredientUnit(db_models.Model):
    name = db_models.CharField(max_length=256)
    user = db_models.ForeignKey(
        settings.AUTH_USER_MODEL,
        blank=False,
        null=False,
        on_delete=db_models.CASCADE,
        related_name="ingredient_units",
    )

    class Meta:
        unique_together = ["name", "user"]

    def __str__(self):
        return self.name


class Ingredient(db_models.Model):
    amount = db_models.CharField(max_length=16)
    brand = db_models.ForeignKey(
        IngredientBrand,
        blank=True,
        null=True,
        on_delete=db_models.CASCADE,
        related_name="ingredients",
    )
    description = db_models.ForeignKey(
        IngredientDescription, on_delete=db_models.CASCADE, related_name="ingredients"
    )
    recipe = db_models.ForeignKey(
        Recipe, on_delete=db_models.CASCADE, related_name="ingredients"
    )
    unit = db_models.ForeignKey(
        IngredientUnit,
        blank=True,
        null=True,
        on_delete=db_models.CASCADE,
        related_name="ingredients",
    )

    def __str__(self):
        return " ".join(
            a
            for a in [
                self.amount,
                self.unit.name if self.unit else None,
                self.brand.name if self.brand else None,
                self.description.text if self.description else None,
            ]
            if a
        )
