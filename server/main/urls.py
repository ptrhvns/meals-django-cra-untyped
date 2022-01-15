from django import urls

from main import views

urlpatterns = [
    urls.path("csrf_token_cookie/", views.csrf_token_cookie, name="csrf_token_cookie"),
    urls.path("signup/", views.signup, name="signup"),
]
