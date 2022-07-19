jest.mock("./useAuthn", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

import Cookies from "js-cookie";
import useApi, { ROUTES } from "./useApi";
import useAuthn from "./useAuthn";
import { render } from "@testing-library/react";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { useNavigate } from "react-router-dom";

const server = setupServer(
  rest.get(ROUTES.csrfToken(), (_req, res, ctx) => res(ctx.status(204))),
  rest.post(ROUTES.signup(), (_req, res, ctx) => res(ctx.status(204)))
);

afterAll(() => server.close());
afterEach(() => server.resetHandlers());
beforeAll(() => server.listen());

let logout;
let navigate;

beforeEach(() => {
  logout = jest.fn();
  useAuthn.mockReturnValue({ logout });
  navigate = jest.fn();
  useNavigate.mockReturnValue(navigate);
});

function TestComponent({ callback }) {
  callback(useApi());
  return <></>;
}

function buildComponent(props) {
  return <TestComponent {...props} />;
}

describe("send()", () => {
  describe("when given data cannot be converted to JSON", () => {
    it("returns an error", async () => {
      server.use(
        rest.get(ROUTES.csrfToken(), (_req, res, ctx) => res(ctx.status(204)))
      );

      const invalidData = BigInt(1); // BigInt invalid in JSON.stringify().
      let result;

      render(
        buildComponent({
          callback: (api) => {
            result = api.send({
              data: invalidData,
              method: "GET",
              route: "csrfToken",
            });
          },
        })
      );

      expect(await result).toMatchObject({
        isError: true,
        message: "Your request could not be properly formatted.",
      });
    });
  });

  describe("when given route is invalid", () => {
    it("returns an error", async () => {
      server.use(
        rest.get(ROUTES.csrfToken(), (_, res, ctx) => res(ctx.status(204)))
      );

      const invalidRoute = "invalidRoute";
      let result;

      render(
        buildComponent({
          callback: (api) => {
            result = api.send({ method: "GET", route: invalidRoute });
          },
        })
      );

      expect(await result).toMatchObject({
        isError: true,
        message: "We tried to send your request to an unknown location.",
      });
    });
  });

  describe("when request can not be sent", () => {
    it("returns an error", async () => {
      server.use(
        rest.get(ROUTES.csrfToken(), (_req, res, _ctx) => res.networkError())
      );

      let result;

      render(
        buildComponent({
          callback: (api) => {
            result = api.send({ method: "GET", route: "csrfToken" });
          },
        })
      );

      expect(await result).toMatchObject({
        isError: true,
        message: "Your request could not be sent.",
      });
    });
  });

  describe("when response is invalid JSON", () => {
    it("returns an error", async () => {
      const invalidJSON = "{";

      server.use(
        rest.get(ROUTES.csrfToken(), (_req, res, ctx) =>
          res(
            ctx.body(invalidJSON),
            ctx.set("Content-Type", "application/json"),
            ctx.status(422)
          )
        )
      );

      let result;

      render(
        buildComponent({
          callback: (api) => {
            result = api.send({ method: "GET", route: "csrfToken" });
          },
        })
      );

      expect(await result).toMatchObject({
        isError: true,
        message: "The response to your request was in an invalid format.",
      });
    });
  });

  describe("when response status is not OK", () => {
    [401, 403].forEach((status) => {
      describe(`when response status is ${status}`, () => {
        it("logs user out", async () => {
          server.use(
            rest.get(ROUTES.csrfToken(), (_req, res, ctx) =>
              res(ctx.status(status), ctx.json({ message: "Test error." }))
            )
          );

          let result;

          render(
            buildComponent({
              callback: (api) => {
                result = api.send({ method: "GET", route: "csrfToken" });
              },
            })
          );

          await result;
          expect(logout).toHaveBeenCalled();
        });

        it("navigates user to login route", async () => {
          server.use(
            rest.get(ROUTES.csrfToken(), (_req, res, ctx) =>
              res(ctx.status(status), ctx.json({ message: "Test error." }))
            )
          );

          let result;

          render(
            buildComponent({
              callback: (api) => {
                result = api.send({ method: "GET", route: "csrfToken" });
              },
            })
          );

          await result;
          logout.mock.lastCall[0]();
          expect(navigate).toHaveBeenCalledWith(ROUTES.login());
        });
      });
    });

    describe("when response status is not 401 or 403", () => {
      describe("when response contains a message", () => {
        it("returns an error with that message", async () => {
          const message = "Test error.";

          server.use(
            rest.get(ROUTES.csrfToken(), (_req, res, ctx) =>
              res(ctx.status(500), ctx.json({ message }))
            )
          );

          let result;

          render(
            buildComponent({
              callback: (api) => {
                result = api.send({ method: "GET", route: "csrfToken" });
              },
            })
          );

          expect(await result).toMatchObject({ isError: true, message });
        });
      });

      describe("when response does not contain a message", () => {
        it("returns an error with a default message", async () => {
          server.use(
            rest.get(ROUTES.csrfToken(), (_req, res, ctx) =>
              res(ctx.status(500), ctx.json({}))
            )
          );

          let result;

          render(
            buildComponent({
              callback: (api) => {
                result = api.send({ method: "GET", route: "csrfToken" });
              },
            })
          );

          expect(await result).toMatchObject({
            isError: true,
            message: "The response to your request was an error.",
          });
        });
      });
    });
  });

  describe("when response status is OK", () => {
    it("returns response's JSON", async () => {
      let json = { data: "Test data." };

      server.use(
        rest.get(ROUTES.csrfToken(), (_req, res, ctx) =>
          res(ctx.status(200), ctx.json(json))
        )
      );

      let result;

      render(
        buildComponent({
          callback: (api) => {
            result = api.send({ method: "GET", route: "csrfToken" });
          },
        })
      );

      expect(await result).toEqual(json);
    });
  });
});

describe("get()", () => {
  it("sends GET request to API", async () => {
    let wasGETUsed = false;

    server.events.on("request:start", (req) => {
      if (req.method == "GET") wasGETUsed = true;
    });

    let result;

    render(
      buildComponent({
        callback: (api) => {
          result = api.get({ method: "GET", route: "csrfToken" });
        },
      })
    );

    await result;
    expect(wasGETUsed).toEqual(true);
  });
});

describe("post()", () => {
  it("send GET request for CSRF token, then sends POST request", async () => {
    const token = "testtoken";
    let GETURL;
    let wasGETUsedFirst = false;
    let wasPOSTUsedLast = false;
    let xCSRFTokenHeader;

    Cookies.set("csrftoken", token);

    server.events.on("request:start", (req) => {
      if (req.method == "GET" && wasPOSTUsedLast == false) {
        wasGETUsedFirst = true;
        GETURL = req.url.href;
      } else if (req.method == "POST" && wasGETUsedFirst == true) {
        wasPOSTUsedLast = true;
        xCSRFTokenHeader = req.headers.get("x-csrftoken");
      }
    });

    let result;

    render(
      buildComponent({
        callback: (api) => {
          result = api.post({ data: {}, method: "POST", route: "signup" });
        },
      })
    );

    await result;

    expect(GETURL).toContain(ROUTES.csrfToken());
    expect(wasGETUsedFirst).toEqual(true);
    expect(wasPOSTUsedLast).toEqual(true);
    expect(xCSRFTokenHeader).toEqual(token);
    Cookies.remove("csrftoken");
  });
});
