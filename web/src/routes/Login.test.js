jest.mock("../hooks/useAuthn", () => ({
  __esModule: true,
  default: jest.fn(),
}));

import Login from "./Login";
import useAuthn from "../hooks/useAuthn";
import { act, render, waitFor } from "@testing-library/react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";

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
  const container = document.createElement("div");
  const root = createRoot(container);
  act(() => root.render(buildComponent()));
});

it("renders the correct <title>", async () => {
  render(buildComponent());
  await waitFor(() => expect(document.title).toContain("Login"));
});
