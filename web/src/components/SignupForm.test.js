jest.mock("../hooks/useApi", () => ({
  __esModule: true,
  default: jest.fn(),
}));

import SignupForm from "./SignupForm";
import useApi from "../hooks/useApi";
import userEvent from "@testing-library/user-event";
import { act, render, screen, waitFor } from "@testing-library/react";
import { createRoot } from "react-dom/client";
import { head } from "lodash";
import { MemoryRouter } from "react-router-dom";

function buildComponent() {
  return (
    <MemoryRouter>
      <SignupForm />
    </MemoryRouter>
  );
}

async function submitForm(user) {
  await user.type(screen.getByLabelText("Username"), "smith");
  await user.type(screen.getByLabelText("Email"), "smith@example.com");
  await user.type(screen.getByLabelText("Password"), "alongpassword");
  await user.click(screen.getByRole("button", { name: "Create account" }));
}

const post = jest.fn();

beforeEach(() => {
  post.mockResolvedValue({});
  useApi.mockReturnValue({ post });
});

it("renders successfully", () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  act(() => root.render(buildComponent()));
});

describe("when the form has been submitted", () => {
  describe("when the required form fields are missing", () => {
    it("renders field errors", async () => {
      const user = userEvent.setup();
      render(buildComponent());
      await user.click(screen.getByRole("button", { name: "Create account" }));
      await waitFor(() =>
        expect(screen.queryByText("Username is required.")).toBeTruthy()
      );
      expect(screen.queryByText("Email is required.")).toBeTruthy();
      expect(screen.queryByText("Password is required.")).toBeTruthy();
    });
  });

  it("submits form data to the API", async () => {
    post.mockReturnValue(Promise.resolve({ message: "success" }));
    const user = userEvent.setup();
    render(buildComponent());
    await submitForm(user);

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
      render(buildComponent());
      await submitForm(user);
      await waitFor(() =>
        expect(screen.queryByText(head(errors.email))).toBeTruthy()
      );
      expect(screen.queryByText(head(errors.password))).toBeTruthy();
      expect(screen.queryByText(head(errors.username))).toBeTruthy();
    });
  });

  describe("when the API returns success", () => {
    it("renders a confirmation message", async () => {
      post.mockReturnValue(Promise.resolve({ message: "success" }));
      const user = userEvent.setup();
      const container = render(buildComponent());
      await submitForm(user);
      await waitFor(() =>
        expect(container.queryByTestId("signup-form-confirmation")).toBeTruthy()
      );
    });
  });
});
