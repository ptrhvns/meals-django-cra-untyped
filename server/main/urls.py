from django import urls

from main import views

urlpatterns = [
    urls.path("csrf_token_cookie/", views.csrf_token_cookie, name="csrf_token_cookie"),
    urls.path("login/", views.login, name="login"),
    urls.path("signup/", views.signup, name="signup"),
    urls.path(
        "signup_confirmation/", views.signup_confirmation, name="signup_confirmation"
    ),
]
