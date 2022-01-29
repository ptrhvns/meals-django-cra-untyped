import { get, post, routes, send } from "./api";
import { rest } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
  rest.get(routes.csrfTokenCookie(), (req, res, ctx) => res(ctx.status(204))),
  rest.post(routes.signup(), () => res(ctx.status(204)))
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("send()", () => {
  describe("when the API response could not be sent", () => {
    it("returns an error object", async () => {
      server.use(
        rest.get(routes.csrfTokenCookie(), (req, res, ctx) =>
          res.networkError()
        )
      );

      const result = await send({ method: "GET", route: "csrfTokenCookie" });

      expect(result).toMatchObject({
        isError: true,
        message: "Your request could not be sent.",
      });
    });
  });

  describe("when the API responds with an error", () => {
    describe("when error contains a message", () => {
      it("returns an error object with that message", async () => {
        const message = "test error";

        server.use(
          rest.get(routes.csrfTokenCookie(), (req, res, ctx) =>
            res(ctx.status(422), ctx.json({ message }))
          )
        );

        const result = await send({ method: "GET", route: "csrfTokenCookie" });
        expect(result).toMatchObject({ isError: true, message });
      });
    });

    describe("when error does not contain a message", () => {
      it("returns an error object with a default message", async () => {
        server.use(
          rest.get(routes.csrfTokenCookie(), (req, res, ctx) =>
            res(ctx.status(422))
          )
        );

        const result = await send({ method: "GET", route: "csrfTokenCookie" });

        expect(result).toMatchObject({
          isError: true,
          message: "An error occurred.",
        });
      });
    });

    describe("when error contains other data", () => {
      it("returns an error object with that other data", async () => {
        const data = { test: "test error data" };

        server.use(
          rest.get(routes.csrfTokenCookie(), (req, res, ctx) =>
            res(ctx.status(422), ctx.json({ data }))
          )
        );

        const result = await send({ method: "GET", route: "csrfTokenCookie" });
        expect(result).toMatchObject({ data, isError: true });
      });
    });
  });

  describe("when the API responds successfully", () => {
    describe("when the API contains data", () => {
      it("returns an object with that data", async () => {
        const data = { test: "test data" };

        server.use(
          rest.get(routes.csrfTokenCookie(), (req, res, ctx) =>
            res(ctx.json({ data }))
          )
        );

        const result = await send({ method: "GET", route: "csrfTokenCookie" });
        expect(result).toMatchObject({ data });
      });
    });

    describe("when the API does not contain data", () => {
      it("returns an empty object", async () => {
        server.use(
          rest.get(routes.csrfTokenCookie(), (req, res, ctx) =>
            res(ctx.status(204))
          )
        );

        const result = await send({ method: "GET", route: "csrfTokenCookie" });
        expect(result).toEqual({});
      });
    });
  });
});

describe("get()", () => {
  it("calls the API with the GET method", async () => {
    let wasGETUsed = false;

    server.events.on("request:start", (req) => {
      if (req.method == "GET") wasGETUsed = true;
    });

    await get({ route: "csrfTokenCookie" });
    expect(wasGETUsed).toEqual(true);
  });
});

describe("post()", () => {
  it("calls the API to get a CSRF, then with the POST method ", async () => {
    let GETURL;
    let wasGETUsedFirst = false;
    let wasPOSTUsedLast = false;

    server.events.on("request:start", (req) => {
      if (req.method == "GET" && wasPOSTUsedLast == false) {
        wasGETUsedFirst = true;
        GETURL = req.url.href;
      } else if (req.method == "POST" && wasGETUsedFirst == true) {
        wasPOSTUsedLast = true;
      }
    });

    await post({ data: {}, route: "signup" });
    expect(GETURL).toContain(routes.csrfTokenCookie());
    expect(wasGETUsedFirst).toEqual(true);
    expect(wasPOSTUsedLast).toEqual(true);
  });
});
