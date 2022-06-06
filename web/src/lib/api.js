import Cookies from "js-cookie";
import { omit } from "lodash";

// istanbul ignore next
// prettier-ignore
export const routes = {
  accountDestroy: () => "/api/account/destroy/",
  csrfToken: () => "/api/csrf_token/",
  login: () => "/api/login/",
  logout: () => "/api/logout/",
  recipe: ({ recipeId }) => `/api/recipe/${recipeId}/`,
  recipeCreate: () => "/api/recipe/create/",
  recipeRating: ({ recipeId }) => `/api/recipe_rating/${recipeId}/`,
  recipeRatingDestroy: ({ recipeId }) => `/api/recipe_rating/${recipeId}/destroy/`,
  recipeRatingUpdate: ({ recipeId }) => `/api/recipe_rating/${recipeId}/update/`,
  recipes: () => "/api/recipes/",
  recipeTag: ({ tagId }) => `/api/recipe_tag/${tagId}/`,
  recipeTagAssociate: ({ recipeId }) => `/api/recipe/${recipeId}/recipe_tag/associate/`,
  recipeTagDestroy: ({ tagId }) => `/api/recipe_tag/${tagId}/destroy/`,
  recipeTagSearch: () => `/api/recipe_tag/search/`,
  recipeTagUpdate: ({ tagId }) => `/api/recipe_tag/${tagId}/update/`,
  recipeTime: ({ timeId }) => `/api/recipe_time/${timeId}/`,
  recipeTimeCreate: ({ recipeId }) => `/api/recipe/${recipeId}/recipe_time/create/`,
  recipeTimeDestroy: ({ timeId }) => `/api/recipe_time/${timeId}/destroy/`,
  recipeTimeUpdate: ({ timeId }) => `/api/recipe_time/${timeId}/update/`,
  recipeTitleUpdate: ({ recipeId }) => `/api/recipe_title/${recipeId}/update/`,
  signup: () => "/api/signup/",
  signupConfirmation: () => "/api/signup_confirmation/",
};

export async function send({ data, headers, method, route, routeData }) {
  const body = data ? JSON.stringify(data) : null;

  headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...headers,
  };

  const mode = "same-origin";
  const url = routes[route](routeData);
  let response;

  try {
    response = await fetch(url, { body, headers, method, mode });
  } catch (error) {
    return {
      isError: true,
      message: "Your request could not be sent.",
    };
  }

  let json;

  try {
    json = await response.json();
  } catch (error) {
    json = {};
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      return {
        isError: true,
        isUnauthorized: true,
        message: json.message ?? "Your request was unauthorized.",
      };
    }

    return {
      isError: true,
      message: json.message ?? "An error occurred.",
      ...omit(json, "message"),
    };
  }

  return json;
}

export function get({ ...args }) {
  return send({ method: "GET", ...args });
}

export async function post({ ...args }) {
  await get({ route: "csrfToken" });

  return await send({
    headers: { "X-CSRFToken": Cookies.get("csrftoken"), ...args.headers },
    method: "POST",
    ...omit(args, "headers"),
  });
}
