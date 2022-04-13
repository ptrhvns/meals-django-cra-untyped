jest.mock("../hooks/useAuthn", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  __esModule: true,
  ...jest.requireActual("react-router-dom"),
  Navigate: function ({ replace, to }) {
    return (
      <>
        <div>to is {to}</div>
        <div>{replace && <>replace is true</>}</div>
      </>
    );
  },
}));

import AuthnProvider from "../providers/AuthnProvider";
import RequireGuest from "./RequireGuest";
import useAuthn from "../hooks/useAuthn";
import { Navigate } from "react-router-dom";
import { render } from "@testing-library/react";

function buildComponent() {
  return (
    <RequireGuest>
      <div>test children</div>
    </RequireGuest>
  );
}

describe("when user is authenticated", () => {
  it("navigates user to /dashboard", () => {
    useAuthn.mockReturnValue({ isAuthenticated: true });
    const { getByText } = render(buildComponent());
    expect(getByText("to is /dashboard")).toBeTruthy();
    expect(getByText("replace is true")).toBeTruthy();
  });
});

describe("when user is not authenticated", () => {
  it("renders given children", () => {
    useAuthn.mockReturnValue({ isAuthenticated: false });
    const { getByText } = render(buildComponent());
    expect(getByText("test children")).toBeTruthy();
  });
});
