import App from "./App";
import AuthnProvider from "./providers/AuthnProvider";
import ReactDOM from "react-dom";
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
  const div = document.createElement("div");
  ReactDOM.render(buildComponent(), div);
});
