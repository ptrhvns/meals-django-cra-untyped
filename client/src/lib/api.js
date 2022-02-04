import { omit } from "lodash";

/* istanbul ignore next */
export const routes = {
  csrfTokenCookie: () => "/api/csrf_token_cookie/",
  login: () => "/api/login/",
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
    const message = json.message ?? "An error occurred.";
    const rest = omit(json, (value, key) => key === "message");
    return { isError: true, message, ...rest };
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
