from django.conf import settings

# These represent URLs or routes available on the client app.
urls = {
    "home": settings.BASE_CLIENT_URI,
    "signup_confirmation": settings.BASE_CLIENT_URI + "/signup-confirmation/{token}",
}
