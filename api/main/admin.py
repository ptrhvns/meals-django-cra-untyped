from django.contrib import admin

from main import models


@admin.register(models.User)
class UserAdmin(admin.ModelAdmin):
    pass


@admin.register(models.Token)
class TokenAdmin(admin.ModelAdmin):
    pass
