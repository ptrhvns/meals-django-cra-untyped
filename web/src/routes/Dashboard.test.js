jest.mock("../components/RecipeList", () => ({
  __esModule: true,
  default: jest.fn(() => <div />),
}));

import AuthnProvider from "../providers/AuthnProvider";
import Dashboard from "./Dashboard";
import RecipeList from "../components/RecipeList";
import { act, render, waitFor } from "@testing-library/react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";

beforeEach(() => {
  RecipeList.mockReturnValue(<div />);
});

function buildComponent() {
  return (
    <MemoryRouter>
      <HelmetProvider>
        <AuthnProvider>
          <Dashboard />
        </AuthnProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

it("renders successfully", () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  act(() => root.render(buildComponent()));
});

it("renders the correct <title>", async () => {
  render(buildComponent());
  await waitFor(() => expect(document.title).toContain("Dashboard"));
});
