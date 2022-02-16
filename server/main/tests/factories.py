import factory

from main import models


# XXX: consider using main.models.User.create_user() instead.
class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = models.User

    email = factory.LazyAttribute(lambda u: f"{u.username}@example.com")
    username = factory.Sequence(lambda n: f"user{n}")

    @factory.post_generation
    def password(obj, create, extracted, **kwargs):
        if extracted:
            obj.set_password(extracted)


class RecipeFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = models.Recipe

    title = factory.Sequence(lambda n: f"Recipe #{n}")
    user = factory.SubFactory(UserFactory)


class TokenFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = models.Token

    user = factory.SubFactory(UserFactory)
