import AuthnProvider from "../providers/AuthnProvider";
import TermsAndConditions from "./TermsAndConditions";
import { act, render, waitFor } from "@testing-library/react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";

function buildComponent() {
  return (
    <MemoryRouter>
      <HelmetProvider>
        <AuthnProvider>
          <TermsAndConditions />
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
  await waitFor(() => expect(document.title).toContain("Terms and Conditions"));
});
