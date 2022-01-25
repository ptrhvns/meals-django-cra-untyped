import factory

from main import models


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = models.User

    email = factory.LazyAttribute(lambda u: f"{u.username}@example.com")
    username = factory.Sequence(lambda n: f"user{n}")


class TokenFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = models.Token

    user = factory.SubFactory(UserFactory)
