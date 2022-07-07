jest.mock("../components/RecipeList", () => ({
  __esModule: true,
  default: jest.fn(() => <div />),
}));

import AuthnProvider from "../providers/AuthnProvider";
import Dashboard from "./Dashboard";
import ReactDOM from "react-dom";
import RecipeList from "../components/RecipeList";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { render, waitFor } from "@testing-library/react";

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
  const div = document.createElement("div");
  ReactDOM.render(buildComponent(), div);
});

it("renders the correct <title>", async () => {
  const component = render(buildComponent());
  await waitFor(() => expect(document.title).toContain("Dashboard"));
});
