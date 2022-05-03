import Cookies from "js-cookie";
import { omit } from "lodash";

// istanbul ignore next
export const routes = {
  createRecipeTime: ({ recipeId }) => `/api/create_recipe_time/${recipeId}/`,
  csrfToken: () => "/api/csrf_token/",
  deleteAccount: () => "/api/delete_account/",
  deleteRecipeTag: ({ tagId }) => `/api/delete_recipe_tag/${tagId}`,
  login: () => "/api/login/",
  logout: () => "/api/logout/",
  recipe: ({ recipeId }) => `/api/recipe/${recipeId}/`,
  recipeCreate: () => "/api/recipe_create/",
  recipes: () => "/api/recipes/",
  recipeTag: ({ tagId }) => `/api/recipe_tag/${tagId}/`,
  recipeTagCreate: ({ recipeId }) =>
    `/api/recipe/${recipeId}/recipe_tag/create/`,
  signup: () => "/api/signup/",
  signupConfirmation: () => "/api/signup_confirmation/",
  updateRecipeTag: ({ tagId }) => `/api/update_recipe_tag/${tagId}`,
  updateRecipeTitle: ({ recipeId }) => `/api/update_recipe_title/${recipeId}/`,
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
