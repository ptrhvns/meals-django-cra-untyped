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

describe("when user clicks on button to log out", () => {
  it("sends logout request to server", async () => {
    const logout = jest.fn();
    useAuthn.mockReturnValue({ isAuthenticated: true, logout });
    post.mockResolvedValue({});
    const user = userEvent.setup();

    await act(async () => {
      const { getByRole } = render(buildComponent());
      await user.click(getByRole("button", { name: "Log out" }));
    });

    expect(logout).toHaveBeenCalled();
  });

  it.todo("calls logout from authentication provider");
});
