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
from django import urls
from django.conf import settings
from django.contrib import admin

from main import views

handler400 = views.bad_request
handler403 = views.forbidden
handler404 = views.not_found
handler500 = views.internal_server_error

urlpatterns = [
    urls.path("api/", urls.include("main.urls")),
]

if settings.DEBUG:
    urlpatterns += [urls.path("admin/", admin.site.urls)]
