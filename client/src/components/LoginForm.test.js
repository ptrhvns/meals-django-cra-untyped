jest.mock("../lib/api", () => ({ post: jest.fn() }));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

import LoginForm from "./LoginForm";
import ReactDOM from "react-dom";
import userEvent from "@testing-library/user-event";
import { act, render, waitFor } from "@testing-library/react";
import { head } from "lodash";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { post } from "../lib/api";

function buildComponent() {
  return (
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>
  );
}

async function submitForm(user, { getByLabelText, getByRole }) {
  await user.type(getByLabelText("Username"), "smith");
  await user.type(getByLabelText("Password"), "alongpassword");
  await user.click(getByRole("button", { name: "Log in" }));
}

it("renders successfully", () => {
  const div = document.createElement("div");
  ReactDOM.render(buildComponent(), div);
});

let navigate;

beforeEach(() => {
  navigate = jest.fn();
  useNavigate.mockReturnValue(navigate);
});

describe("when the form has been submitted", () => {
  describe("when the required form fields are missing", () => {
    it("renders field errors", async () => {
      const user = userEvent.setup();
      const { getByRole, getByText } = render(buildComponent());
      await user.click(getByRole("button", { name: "Log in" }));
      getByText("Username is required.");
      getByText("Password is required.");
    });
  });

  it("renders submit spinner appropriately throughout", async () => {
    let resolve;
    post.mockResolvedValue(new Promise((res, _) => (resolve = res)));
    const user = userEvent.setup();
    const container = render(buildComponent());
    await act(() => submitForm(user, container));
    const { getByLabelText, getByRole, queryByTestId } = container;
    await waitFor(() => expect(queryByTestId("submit-spinner")).toBeTruthy());
    act(() => resolve({}));

    await waitFor(() =>
      expect(queryByTestId("submit-spinner")).not.toBeTruthy()
    );
  });

  it("submits form data to the API", async () => {
    post.mockResolvedValue(Promise.resolve({}));
    const user = userEvent.setup();
    const container = render(buildComponent());
    await act(() => submitForm(user, container));

    expect(post).toHaveBeenCalledWith({
      data: {
        password: "alongpassword",
        username: "smith",
      },
      route: "login",
    });
  });

  describe("when the API returns a general error message", () => {
    it("renders a dismissable error", async () => {
      const message = "An error occurred.";
      post.mockResolvedValue(Promise.resolve({ isError: true, message }));
      const user = userEvent.setup();
      const container = render(buildComponent());
      await act(() => submitForm(user, container));
      expect(container.queryByText(message)).toBeTruthy();
      await user.click(container.getByRole("button", { name: "Dismiss" }));
      expect(container.queryByText(message)).not.toBeTruthy();
    });
  });

  describe("when the API returns field errors", () => {
    it("renders field errors", async () => {
      const errors = {
        password: ["Password is invalid."],
        username: ["Username is invalid."],
      };

      post.mockResolvedValue(
        Promise.resolve({
          errors,
          isError: true,
          message: "An error occurred.",
        })
      );

      const user = userEvent.setup();
      const container = render(buildComponent());
      await act(() => submitForm(user, container));
      expect(container.queryByText(head(errors.password))).toBeTruthy();
      expect(container.queryByText(head(errors.username))).toBeTruthy();
    });
  });

  describe("when the API returns success", () => {
    it("navigates browser to /dashboard", async () => {
      post.mockResolvedValue({});
      const user = userEvent.setup();
      const container = render(buildComponent());
      await act(() => submitForm(user, container));
      expect(navigate).toHaveBeenCalledWith("/dashboard");
    });
  });
});
