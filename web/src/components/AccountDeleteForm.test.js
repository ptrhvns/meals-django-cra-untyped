jest.mock("../hooks/useApi", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("../hooks/useAuthn", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

import AccountDeleteForm from "./AccountDeleteForm";
import AuthnProvider from "../providers/AuthnProvider";
import useApi from "../hooks/useApi";
import useAuthn from "../hooks/useAuthn";
import userEvent from "@testing-library/user-event";
import { act, render } from "@testing-library/react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { within } from "@testing-library/dom";

function buildComponent() {
  return (
    <MemoryRouter>
      <AuthnProvider>
        <AccountDeleteForm />
      </AuthnProvider>
    </MemoryRouter>
  );
}

async function submitForm(
  user,
  { getByLabelText, getByRole },
  { password = "alongpassword" } = {}
) {
  await user.click(getByRole("button", { name: "Delete my account" }));
  await user.type(getByLabelText("Password"), password);
  await user.click(getByRole("button", { name: "Delete my account" }));
}

const post = jest.fn();
let navigate;

beforeEach(() => {
  post.mockResolvedValue({});
  useApi.mockReturnValue({ post });
  navigate = jest.fn();
  useNavigate.mockReturnValue(navigate);
});

it("renders successfully", () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  act(() => root.render(buildComponent()));
});

it("renders 'Delete my account' button by default", () => {
  const { queryByRole } = render(buildComponent());
  expect(queryByRole("button", { name: "Delete my account" })).toBeTruthy();
});

describe("when user clicks 'Delete my account' button", () => {
  it("renders account deletion form", async () => {
    const user = userEvent.setup();
    const { getByRole, queryByTestId } = render(buildComponent());
    await user.click(getByRole("button", { name: "Delete my account" }));
    expect(queryByTestId("account-delete-form-form")).toBeTruthy();
  });

  describe("when user clicks 'Dismiss' button", () => {
    it("hides account deletion form", async () => {
      const user = userEvent.setup();
      const { getByRole, queryByTestId } = render(buildComponent());
      await user.click(getByRole("button", { name: "Delete my account" }));
      await user.click(getByRole("button", { name: "Dismiss" }));
      expect(queryByTestId("delete-account-form-form")).not.toBeTruthy();
    });
  });
});

describe("when form has been sumbitted", () => {
  describe("when required form fields are missing", () => {
    it("renders field errors", async () => {
      const user = userEvent.setup();
      const { getByRole, getByText } = render(buildComponent());
      await user.click(getByRole("button", { name: "Delete my account" })); // show form
      await user.click(getByRole("button", { name: "Delete my account" })); // submit form
      getByText("Password is required.");
    });
  });

  it("sends form data to API", async () => {
    post.mockResolvedValue({ message: "test success" });
    const logout = jest.fn();
    useAuthn.mockReturnValue({ logout });
    const user = userEvent.setup();
    const container = render(buildComponent());
    const password = "somebigsecret";
    await submitForm(user, container, { password });

    expect(post).toHaveBeenCalledWith({
      data: { password },
      route: "accountDestroy",
    });
  });

  describe("when API returns a general error", () => {
    it("renders that general error as a dismissable alert", async () => {
      const message = "test error";
      post.mockResolvedValue({ isError: true, message });
      const user = userEvent.setup();
      const container = render(buildComponent());
      await submitForm(user, container);
      expect(container.queryByText(message)).toBeTruthy();

      await user.click(
        within(container.getByTestId("alert")).getByRole("button", {
          name: "Dismiss",
        })
      );

      expect(container.queryByText(message)).not.toBeTruthy();
    });
  });

  describe("when API returns field errors", () => {
    it("renders those field errors", async () => {
      const error = "Password is invalid.";

      post.mockResolvedValue({
        isError: true,
        errors: {
          password: [error],
        },
      });

      const user = userEvent.setup();
      const container = render(buildComponent());
      await submitForm(user, container);
      expect(container.queryByText(error)).toBeTruthy();
    });
  });

  describe("when API returns success", () => {
    it("logs out user and navigates to '/'", async () => {
      post.mockResolvedValue({ message: "test success" });
      const navigate = jest.fn();
      useNavigate.mockReturnValue(navigate);
      const logout = jest.fn();
      useAuthn.mockReturnValue({ logout });
      const user = userEvent.setup();
      const container = render(buildComponent());
      await submitForm(user, container);
      expect(logout).toHaveBeenCalled();
      logout.mock.calls[0][0](); // call logout's callback
      expect(navigate).toHaveBeenCalledWith("/");
    });
  });
});
