from django import urls

from main import views

# fmt: off
urlpatterns = [
    urls.path("account/destroy/", views.account_destroy, name="account_destroy"),
    urls.path("csrf_token/", views.csrf_token, name="csrf_token"),
    urls.path("login/", views.login, name="login"),
    urls.path("logout/", views.logout, name="logout"),
    urls.path("recipe/<int:recipe_id>/", views.recipe, name="recipe"),
    urls.path("recipe/<int:recipe_id>/recipe_tag/associate/", views.recipe_tag_associate, name="recipe_tag_associate"),
    urls.path("recipe/<int:recipe_id>/recipe_time/create/", views.recipe_time_create, name="recipe_time_create"),
    urls.path("recipe/create/", views.recipe_create, name="recipe_create"),
    urls.path("recipe_rating/<int:recipe_id>/", views.recipe_rating, name="recipe_rating"),
    urls.path("recipe_rating/<int:recipe_id>/destroy/", views.recipe_rating_destroy, name="recipe_rating_destroy"),
    urls.path("recipe_rating/<int:recipe_id>/update/", views.recipe_rating_update, name="recipe_rating_update"),
    urls.path("recipe_tag/<int:tag_id>/", views.recipe_tag, name="recipe_tag"),
    urls.path("recipe_tag/<int:tag_id>/destroy/", views.recipe_tag_destroy, name="recipe_tag_destroy"),
    urls.path("recipe_tag/<int:tag_id>/update/", views.recipe_tag_update, name="recipe_tag_update"),
    urls.path("recipe_tag/search/", views.recipe_tag_search, name="recipe_tag_search"),
    urls.path("recipe_time/<int:time_id>/", views.recipe_time, name="recipe_time"),
    urls.path("recipe_time/<int:time_id>/destroy/", views.recipe_time_destroy, name="recipe_time_destroy"),
    urls.path("recipe_time/<int:time_id>/update/", views.recipe_time_update, name="recipe_time_update"),
    urls.path("recipe_title/<int:recipe_id>/update/", views.recipe_title_update, name="recipe_title_update"),
    urls.path("recipes/", views.recipes, name="recipes"),
    urls.path("signup/", views.signup, name="signup"),
    urls.path("signup_confirmation/", views.signup_confirmation, name="signup_confirmation"),
]
