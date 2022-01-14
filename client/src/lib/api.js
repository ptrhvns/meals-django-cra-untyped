const routes = {
  csrfTokenCookie: () => "/api/csrf-token-cookie/",
  signup: () => "/api/signup/",
};

export async function post({ data, route }) {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  const mode = "same-origin";

  await fetch(routes["csrfTokenCookie"](), {
    headers,
    method: "GET",
    mode,
  });

  return await fetch(routes[route](), {
    body: JSON.stringify(data),
    headers,
    method: "POST",
    mode,
  });
}
