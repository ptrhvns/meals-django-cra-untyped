import AuthnProvider from "../providers/AuthnProvider";
import ReactDOM from "react-dom";
import Recipe from "./Recipe";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { render, waitFor } from "@testing-library/react";

function buildComponent() {
  return (
    <MemoryRouter>
      <HelmetProvider>
        <AuthnProvider>
          <Recipe />
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

  // TODO ensure page title reflects recipe title
  await waitFor(() => expect(document.title).toContain("Recipe"));
});
