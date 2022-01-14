from django import urls

from main import views

urlpatterns = [
    urls.path("csrf_token/", views.csrf_token, name="csrf_token"),
    urls.path("signup/", views.signup, name="signup"),
]
