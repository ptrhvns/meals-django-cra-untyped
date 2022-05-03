from django import urls

from main import views

urlpatterns = [
    urls.path("csrf_token/", views.csrf_token, name="csrf_token"),
    urls.path("delete_account/", views.delete_account, name="delete_account"),
    urls.path("delete_recipe_tag/<int:tag_id>", views.delete_recipe_tag, name="delete_recipe_tag"),
    urls.path("login/", views.login, name="login"),
    urls.path("logout/", views.logout, name="logout"),
    urls.path("recipe/<int:recipe_id>/", views.recipe, name="recipe"),
    urls.path("recipe/<int:recipe_id>/recipe_tag/create/", views.recipe_tag_create, name="recipe_tag_create"),
    urls.path("recipe/<int:recipe_id>/recipe_time/create/", views.recipe_time_create, name="recipe_time_create"),
    urls.path("recipe/create/", views.recipe_create, name="recipe_create"),
    urls.path("recipe_tag/<int:tag_id>/", views.recipe_tag, name="recipe_tag"),
    urls.path("recipes/", views.recipes, name="recipes"),
    urls.path("signup/", views.signup, name="signup"),
    urls.path("signup_confirmation/", views.signup_confirmation, name="signup_confirmation"),
    urls.path("update_recipe_tag/<int:tag_id>", views.update_recipe_tag, name="update_recipe_tag"),
    urls.path("update_recipe_title/<int:recipe_id>/", views.update_recipe_title, name="update_recipe_title"),
]
