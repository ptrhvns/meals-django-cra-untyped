from django.conf import settings

urls = {
    "home": settings.BASE_CLIENT_URI,
    "signup_confirmation": settings.BASE_CLIENT_URI + "/signup-confirmation/{token}",
}
