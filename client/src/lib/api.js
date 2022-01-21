import { omit } from "lodash";

const routes = {
  csrfTokenCookie: () => "/api/csrf_token_cookie/",
  signup: () => "/api/signup/",
  signupConfirmation: () => "/api/signup_confirmation/",
};

export async function send({ data, method, route, routeData }) {
  const body = data ? JSON.stringify(data) : null;

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
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

  let json = {};

  try {
    json = await response.json();
  } catch (_) {
    // noop
  }

  if (!response.ok) {
    return {
      isError: true,
      message: json.message ?? "An error occurred.",
      ...omit(json, (value, key) => key === "message"),
    };
  }

  return json;
}

export function get({ ...args }) {
  return send({ method: "GET", ...args });
}

export async function post({ ...args }) {
  await get({ route: "csrfTokenCookie" });
  return await send({ method: "POST", ...args });
}
