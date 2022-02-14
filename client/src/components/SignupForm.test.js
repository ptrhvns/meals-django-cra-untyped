jest.mock("../lib/api", () => ({ post: jest.fn() }));

import ReactDOM from "react-dom";
import SignupForm from "./SignupForm";
import userEvent from "@testing-library/user-event";
import { act, render, waitFor } from "@testing-library/react";
import { head } from "lodash";
import { MemoryRouter } from "react-router-dom";
import { post } from "../lib/api";

function buildComponent() {
  return (
    <MemoryRouter>
      <SignupForm />
    </MemoryRouter>
  );
}

async function submitForm(user, { getByLabelText, getByRole }) {
  await user.type(getByLabelText("Username"), "smith");
  await user.type(getByLabelText("Email"), "smith@example.com");
  await user.type(getByLabelText("Password"), "alongpassword");
  await user.click(getByRole("button", { name: "Create account" }));
}

it("renders successfully", () => {
  const div = document.createElement("div");
  ReactDOM.render(buildComponent(), div);
});

describe("when the form has been submitted", () => {
  describe("when the required form fields are missing", () => {
    it("renders field errors", async () => {
      const user = userEvent.setup();
      const { getByRole, getByText } = render(buildComponent());
      await user.click(getByRole("button", { name: "Create account" }));
      getByText("Username is required.");
      getByText("Email is required.");
      getByText("Password is required.");
    });
  });

  it("renders submit spinner appropriately throughout", async () => {
    let resolve;
    post.mockReturnValue(new Promise((res, _) => (resolve = res)));
    const user = userEvent.setup();
    const container = render(buildComponent());
    const { getByLabelText, getByRole, queryByTestId } = container;
    await act(() => submitForm(user, container));
    await waitFor(() => expect(queryByTestId("submit-spinner")).toBeTruthy());
    act(() => resolve({ message: "success" }));

    await waitFor(() =>
      expect(queryByTestId("submit-spinner")).not.toBeTruthy()
    );
  });

  it("submits form data to the API", async () => {
    post.mockReturnValue(Promise.resolve({ message: "success" }));
    const user = userEvent.setup();
    const container = render(buildComponent());
    await act(() => submitForm(user, container));

    expect(post).toHaveBeenCalledWith({
      data: {
        email: "smith@example.com",
        password: "alongpassword",
        username: "smith",
      },
      route: "signup",
    });
  });

  describe("when the API returns a general error message", () => {
    it("renders a dismissable error Alert", async () => {
      const message = "An error occurred.";
      post.mockReturnValue(Promise.resolve({ isError: true, message }));
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
        email: ["Email is invalid."],
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
      const container = render(buildComponent());
      await act(() => submitForm(user, container));
      expect(container.queryByText(head(errors.email))).toBeTruthy();
      expect(container.queryByText(head(errors.password))).toBeTruthy();
      expect(container.queryByText(head(errors.username))).toBeTruthy();
    });
  });

  describe("when the API returns success", () => {
    it("renders a confirmation message", async () => {
      post.mockReturnValue(Promise.resolve({ message: "success" }));
      const user = userEvent.setup();
      const container = render(buildComponent());
      await act(() => submitForm(user, container));
      expect(container.queryByTestId("signup-form-confirmation")).toBeTruthy();
    });
  });
});
