"""config URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django import http, urls
from django.conf import settings
from django.contrib import admin
from rest_framework import status


def bad_request(request, exception=None):
    return http.JsonResponse(
        {"message": "Your request was invalid."}, status=status.HTTP_400_BAD_REQUEST
    )


def forbidden(request, exception=None):
    return http.JsonResponse(
        {"message": "Your request was not authorized."},
        status=status.HTTP_403_FORBIDDEN,
    )


def not_found(request, exception=None):
    return http.JsonResponse(
        {"message": "A resource matching your request was not found."},
        status=status.HTTP_404_NOT_FOUND,
    )


def internal_server_error(request, exception=None):
    return http.JsonResponse(
        {"message": "An error occurred while processing your request."},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )


handler400 = bad_request
handler403 = forbidden
handler404 = not_found
handler500 = internal_server_error

urlpatterns = [
    urls.path("api/", urls.include("main.urls")),
]

if settings.DEBUG:
    urlpatterns += [urls.path("admin/", admin.site.urls)]
