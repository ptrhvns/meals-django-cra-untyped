jest.mock("../hooks/useAuthn", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("../lib/api", () => ({
  post: jest.fn(),
}));

import AuthnProvider from "../providers/AuthnProvider";
import Navbar from "./Navbar";
import ReactDOM from "react-dom";
import useAuthn from "../hooks/useAuthn";
import userEvent from "@testing-library/user-event";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { post } from "../lib/api";
import { act, render } from "@testing-library/react";

function buildComponent() {
  return (
    <MemoryRouter>
      <AuthnProvider>
        <Navbar />
      </AuthnProvider>
    </MemoryRouter>
  );
}

it("renders successfully", () => {
  const div = document.createElement("div");
  useAuthn.mockReturnValue({ isAuthenticated: true, logout: jest.fn() });
  ReactDOM.render(buildComponent(), div);
});

describe("when user is logged out", () => {
  it("renders the login button", () => {
    useAuthn.mockReturnValue({ isAuthenticated: false });

    act(() => {
      const { queryByRole } = render(buildComponent());
      expect(queryByRole("link", { name: "Log in" })).toBeTruthy();
    });
  });
});

describe("when user is logged in", () => {
  it("renders the menu button", () => {
    useAuthn.mockReturnValue({ isAuthenticated: true });
    const { queryByRole } = render(buildComponent());
    expect(queryByRole("button", { name: "Menu" })).toBeTruthy();
  });
});

describe("when user clicks on menu button and it's closed", () => {
  it("opens the menu", async () => {
    useAuthn.mockReturnValue({ isAuthenticated: true });
    const user = userEvent.setup();
    const { getByRole, queryByTestId } = render(buildComponent());
    await user.click(getByRole("button", { name: "Menu" }));
    expect(queryByTestId("navbar-menu-list")).toBeTruthy();
  });
});

describe("when user clicks on menu button and it's open", () => {
  it("closes the menu", async () => {
    useAuthn.mockReturnValue({ isAuthenticated: true });
    const user = userEvent.setup();
    const { getByRole, queryByTestId } = render(buildComponent());
    await user.click(getByRole("button", { name: "Menu" }));
    await user.click(getByRole("button", { name: "Menu" }));
    expect(queryByTestId("navbar-menu-list")).not.toBeTruthy();
  });
});

describe("when user clicks outside menu and it's open", () => {
  it("closes the menu", async () => {
    useAuthn.mockReturnValue({ isAuthenticated: true });
    const user = userEvent.setup();
    const { getByRole, getByTestId, queryByTestId } = render(buildComponent());
    await user.click(getByRole("button", { name: "Menu" }));
    await user.click(getByTestId("navbar-logo-wrapper"));
    expect(queryByTestId("navbar-menu-list")).not.toBeTruthy();
  });
});

describe("when user clicks on logout button", () => {
  it("logs user out", async () => {
    const logout = jest.fn();
    useAuthn.mockReturnValue({ isAuthenticated: true, logout });
    post.mockResolvedValue({});
    const user = userEvent.setup();

    await act(async () => {
      const { getByRole } = render(buildComponent());
      await user.click(getByRole("button", { name: "Menu" }));
      await user.click(getByRole("button", { name: "Log out" }));
    });

    expect(post).toHaveBeenCalled();
    expect(logout).toHaveBeenCalled();
  });
});
