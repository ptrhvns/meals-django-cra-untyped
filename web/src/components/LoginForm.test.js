jest.mock("../hooks/useApi", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: jest.fn(),
  useNavigate: jest.fn(),
}));

import AuthnProvider from "../providers/AuthnProvider";
import LoginForm from "./LoginForm";
import useApi from "../hooks/useApi";
import userEvent from "@testing-library/user-event";
import { act, render, screen, waitFor } from "@testing-library/react";
import { createRoot } from "react-dom/client";
import { head } from "lodash";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";

function buildComponent() {
  return (
    <MemoryRouter>
      <AuthnProvider>
        <LoginForm />
      </AuthnProvider>
    </MemoryRouter>
  );
}

async function submitForm(user) {
  await user.type(screen.getByLabelText("Username"), "smith");
  await user.type(screen.getByLabelText("Password"), "alongpassword");
  await user.click(screen.getByRole("button", { name: "Log in" }));
}

it("renders successfully", async () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  await act(async () => root.render(buildComponent()));
});

const post = jest.fn();
let navigate;

beforeEach(() => {
  post.mockResolvedValue({});
  useApi.mockReturnValue({ post });
  navigate = jest.fn();
  useNavigate.mockReturnValue(navigate);
  useLocation.mockReturnValue({ state: {} });
});

describe("when the form has been submitted", () => {
  describe("when the required form fields are missing", () => {
    it("renders field errors", async () => {
      const user = userEvent.setup();
      render(buildComponent());
      await user.click(screen.getByRole("button", { name: "Log in" }));
      await waitFor(() =>
        expect(screen.queryByText("Username is required.")).toBeTruthy()
      );
      await waitFor(() =>
        expect(screen.queryByText("Password is required.")).toBeTruthy()
      );
    });
  });

  it("submits form data to the API", async () => {
    post.mockReturnValue(Promise.resolve({}));
    const user = userEvent.setup();
    render(buildComponent());
    await submitForm(user);

    expect(post).toHaveBeenCalledWith({
      data: {
        password: "alongpassword",
        remember_me: true,
        username: "smith",
      },
      route: "login",
    });
  });

  describe("when the API returns a general error message", () => {
    it("renders a dismissable error", async () => {
      const message = "An error occurred.";
      post.mockReturnValue(Promise.resolve({ isError: true, message }));
      const user = userEvent.setup();
      render(buildComponent());
      await submitForm(user);
      await waitFor(() => expect(screen.queryByText(message)).toBeTruthy());
      await user.click(screen.getByRole("button", { name: "Dismiss" }));
      expect(screen.queryByText(message)).not.toBeTruthy();
    });
  });

  describe("when the API returns field errors", () => {
    it("renders field errors", async () => {
      const errors = {
        password: ["Password is invalid."],
        username: ["Username is invalid."],
      };

      post.mockReturnValue(
        Promise.resolve({
          errors,
          isError: true,
          message: "An error occurred.",
        })
      );

      const user = userEvent.setup();
      render(buildComponent());
      await submitForm(user);
      await waitFor(() =>
        expect(screen.queryByText(head(errors.password))).toBeTruthy()
      );
      expect(screen.queryByText(head(errors.username))).toBeTruthy();
    });
  });

  describe("when the API returns success", () => {
    describe("when given location does not have `from` state", () => {
      it("navigates browser to /dashboard", async () => {
        post.mockResolvedValue({});
        const user = userEvent.setup();
        render(buildComponent());
        await submitForm(user);
        expect(navigate).toHaveBeenCalledWith("/dashboard", { replace: true });
      });
    });

    describe("when given location has `from` state", () => {
      it("navigates browser to `from` state's pathname", async () => {
        post.mockResolvedValue({});
        const pathname = "/test/path";
        useLocation.mockReturnValue({ state: { from: { pathname } } });
        const user = userEvent.setup();
        render(buildComponent());
        await submitForm(user);
        expect(navigate).toHaveBeenCalledWith(pathname, { replace: true });
      });
    });
  });
});
