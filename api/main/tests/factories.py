import factory

from main import models


# XXX: consider using main.models.User.create_user() instead.
class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = models.User

    email = factory.LazyAttribute(lambda u: f"{u.username}@example.com")
    username = factory.Sequence(lambda n: f"user{n + 1}")

    @factory.post_generation
    def password(obj, create, extracted, **kwargs):
        if extracted:
            obj.set_password(extracted)


class RecipeFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = models.Recipe

    title = factory.Sequence(lambda n: f"Recipe #{n + 1}")
    user = factory.SubFactory(UserFactory)


class RecipeTagFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = models.RecipeTag

    name = factory.Sequence(lambda n: f"Tag#{n + 1}")
    recipe = factory.SubFactory(RecipeFactory)


class RecipeTimeFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = models.RecipeTime

    minutes = 10
    recipe = factory.SubFactory(RecipeFactory)
    time_type = "Cook"


class TokenFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = models.Token

    user = factory.SubFactory(UserFactory)
