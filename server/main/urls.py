from django import urls

from main import views

urlpatterns = [
    urls.path("csrf_token/", views.csrf_token, name="csrf_token"),
    urls.path("delete_account/", views.delete_account, name="delete_account"),
    urls.path("login/", views.login, name="login"),
    urls.path("logout/", views.logout, name="logout"),
    urls.path("signup/", views.signup, name="signup"),
    urls.path(
        "signup_confirmation/", views.signup_confirmation, name="signup_confirmation"
    ),
]
