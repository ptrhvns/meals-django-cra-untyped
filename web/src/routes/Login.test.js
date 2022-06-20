jest.mock("../hooks/useAuthn", () => ({
  __esModule: true,
  default: jest.fn(),
}));

import Login from "./Login";
import ReactDOM from "react-dom";
import useAuthn from "../hooks/useAuthn";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { render, waitFor } from "@testing-library/react";

function buildComponent() {
  return (
    <MemoryRouter>
      <HelmetProvider>
        <Login />
      </HelmetProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  useAuthn.mockReturnValue({ logout: jest.fn() });
});

it("renders successfully", () => {
  const div = document.createElement("div");
  ReactDOM.render(buildComponent(), div);
});

it("renders the correct <title>", async () => {
  const component = render(buildComponent());
  await waitFor(() => expect(document.title).toContain("Login"));
});
