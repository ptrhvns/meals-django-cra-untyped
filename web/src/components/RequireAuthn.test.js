jest.mock("../hooks/useAuthn", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  __esModule: true,
  ...jest.requireActual("react-router-dom"),
  Navigate: function ({ replace, state, to }) {
    return (
      <>
        <div>to is {to}</div>
        <div>{replace && <>replace is true</>}</div>
        <div>location is {state.from.pathname}</div>
      </>
    );
  },
  useLocation: jest.fn(),
}));

import RequireAuthn from "./RequireAuthn";
import useAuthn from "../hooks/useAuthn";
import { render } from "@testing-library/react";
import { useLocation } from "react-router-dom";

function buildComponent() {
  return (
    <RequireAuthn>
      <div>test children</div>
    </RequireAuthn>
  );
}

describe("when user is authenticated", () => {
  it("renders given children", () => {
    useAuthn.mockReturnValue({ isAuthenticated: true });
    const { getByText } = render(buildComponent());
    expect(getByText("test children")).toBeTruthy();
  });
});

describe("when user is not authenticated", () => {
  it("navigates user to /login", () => {
    useAuthn.mockReturnValue({ isAuthenticated: false });
    useLocation.mockReturnValue({ pathname: "/test/path" });
    const { getByText } = render(buildComponent());
    expect(getByText("to is /login")).toBeTruthy();
    expect(getByText("replace is true")).toBeTruthy();
    expect(getByText("location is /test/path")).toBeTruthy();
  });
});
