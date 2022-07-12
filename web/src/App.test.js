import App from "./App";
import AuthnProvider from "./providers/AuthnProvider";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";

function buildComponent() {
  return (
    <HelmetProvider>
      <MemoryRouter>
        <AuthnProvider>
          <App />
        </AuthnProvider>
      </MemoryRouter>
    </HelmetProvider>
  );
}

it("renders successfully", () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  root.render(buildComponent());
});
