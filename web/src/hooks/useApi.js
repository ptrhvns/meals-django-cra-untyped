import Cookies from "js-cookie";
import useAuthn from "./useAuthn";
import { isEmpty } from "lodash";
import { omit } from "lodash";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

// istanbul ignore next
// prettier-ignore
export const API_ROUTES = {
  accountDestroy: () => "/api/account/destroy/",
  csrfToken: () => "/api/csrf_token/",
  ingredient: ({ ingredientId }) => `/api/ingredient/${ingredientId}/`,
  ingredientAssociate: ({ recipeId }) => `/api/ingredient/recipe/${recipeId}/associate/`,
  ingredientBrandSearch: ({ searchTerm }) => `/api/ingredient_brand/search/?search_term=${encodeURI(searchTerm)}`,
  ingredientDescriptionSearch: ({ searchTerm }) => `/api/ingredient_description/search/?search_term=${encodeURI(searchTerm)}`,
  ingredientDestroy: ({ ingredientId }) => `/api/ingredient/${ingredientId}/destroy/`,
  ingredientUnitSearch: ({ searchTerm }) => `/api/ingredient_unit/search/?search_term=${encodeURI(searchTerm)}`,
  ingredientUpdate: ({ ingredientId }) => `/api/ingredient/${ingredientId}/update/`,
  login: () => "/api/login/",
  logout: () => "/api/logout/",
  recipe: ({ recipeId }) => `/api/recipe/${recipeId}/`,
  recipeCreate: () => "/api/recipe/create/",
  recipeEquipment: ({ equipmentId }) => `/api/recipe_equipment/${equipmentId}/`,
  recipeEquipmentAssociate: ({ recipeId }) => `/api/recipe_equipment/recipe/${recipeId}/associate/`,
  recipeEquipmentDestroy: ({ equipmentId }) => `/api/recipe_equipment/${equipmentId}/destroy/`,
  recipeEquipmentDissociate: ({ recipeId, equipmentId }) => `/api/recipe_equipment/${equipmentId}/recipe/${recipeId}/dissociate/`,
  recipeEquipmentSearch: ({ searchTerm }) => `/api/recipe_equipment/search/?search_term=${encodeURI(searchTerm)}`,
  recipeEquipmentUpdate: ({ equipmentId }) => `/api/recipe_equipment/${equipmentId}/update/`,
  recipeEquipmentUpdateForRecipe: ({ recipeId, equipmentId }) => `/api/recipe_equipment/${equipmentId}/recipe/${recipeId}/update/`,
  recipeNotes: ({ recipeId }) => `/api/recipe_notes/${recipeId}/`,
  recipeNotesDestroy: ({ recipeId }) => `/api/recipe_notes/${recipeId}/destroy/`,
  recipeNotesUpdate: ({ recipeId }) => `/api/recipe_notes/${recipeId}/update/`,
  recipeRating: ({ recipeId }) => `/api/recipe_rating/${recipeId}/`,
  recipeRatingDestroy: ({ recipeId }) => `/api/recipe_rating/${recipeId}/destroy/`,
  recipeRatingUpdate: ({ recipeId }) => `/api/recipe_rating/${recipeId}/update/`,
  recipes: () => "/api/recipes/",
  recipeServings: ({ recipeId }) => `/api/recipe_servings/${recipeId}/`,
  recipeServingsDestroy: ({ recipeId }) => `/api/recipe_servings/${recipeId}/destroy/`,
  recipeServingsUpdate: ({ recipeId }) => `/api/recipe_servings/${recipeId}/update/`,
  recipeTag: ({ tagId }) => `/api/recipe_tag/${tagId}/`,
  recipeTagAssociate: ({ recipeId }) => `/api/recipe_tag/recipe/${recipeId}/associate/`,
  recipeTagDestroy: ({ tagId }) => `/api/recipe_tag/${tagId}/destroy/`,
  recipeTagDissociate: ({ recipeId, tagId }) => `/api/recipe_tag/${tagId}/recipe/${recipeId}/dissociate/`,
  recipeTagSearch: ({ searchTerm }) => `/api/recipe_tag/search/?search_term=${encodeURI(searchTerm)}`,
  recipeTagUpdate: ({ tagId }) => `/api/recipe_tag/${tagId}/update/`,
  recipeTagUpdateForRecipe: ({ recipeId, tagId }) => `/api/recipe_tag/${tagId}/recipe/${recipeId}/update/`,
  recipeTime: ({ timeId }) => `/api/recipe_time/${timeId}/`,
  recipeTimeCreate: ({ recipeId }) => `/api/recipe/${recipeId}/recipe_time/create/`,
  recipeTimeDestroy: ({ timeId }) => `/api/recipe_time/${timeId}/destroy/`,
  recipeTimeUpdate: ({ timeId }) => `/api/recipe_time/${timeId}/update/`,
  recipeTitleUpdate: ({ recipeId }) => `/api/recipe_title/${recipeId}/update/`,
  signup: () => "/api/signup/",
  signupConfirmation: () => "/api/signup_confirmation/",
};

// istanbul ignore next
// prettier-ignore
export const WEB_ROUTES = {
  login: () => '/login'
}

const DEFAULT_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

export default function useApi() {
  const navigate = useNavigate();
  const { logout } = useAuthn();

  const send = useCallback(
    async ({ data, headers, method, route, routeData }) => {
      let body;

      try {
        body = data ? JSON.stringify(data) : null;
      } catch (error) {
        return {
          isError: true,
          message: "Your request could not be properly formatted.",
        };
      }

      headers = {
        ...DEFAULT_HEADERS,
        ...headers,
      };

      const mode = "same-origin";

      let url;

      try {
        url = API_ROUTES[route](routeData);
      } catch (error) {
        return {
          isError: true,
          message: "We tried to send your request to an unknown location.",
        };
      }

      let response;

      try {
        response = await fetch(url, { body, headers, method, mode });
      } catch (error) {
        return {
          isError: true,
          message: "Your request could not be sent.",
        };
      }

      if (
        !response.ok &&
        (response.status === 401 || response.status === 403)
      ) {
        logout(() => navigate(WEB_ROUTES.login()));
      }

      let json;
      let text;

      try {
        text = await response.text();

        if (!isEmpty(text)) {
          json = await JSON.parse(text);
        }
      } catch (error) {
        return {
          isError: true,
          message: "The response to your request was in an invalid format.",
        };
      }

      if (!response.ok) {
        return {
          isError: true,
          message: json.message ?? "The response to your request was an error.",
          ...omit(json, "message"),
        };
      }

      return json || {};
    },
    [logout, navigate]
  );

  const get = useCallback(
    ({ ...args }) => send({ method: "GET", ...args }),
    [send]
  );

  const post = useCallback(
    async ({ ...args }) => {
      // API requires a valid CSRF token to process a POST request.
      await get({ route: "csrfToken" });

      return send({
        headers: { "X-CSRFToken": Cookies.get("csrftoken"), ...args.headers },
        method: "POST",
        ...omit(args, "headers"),
      });
    },
    [get, send]
  );

  return {
    get,
    post,
    send,
  };
}
