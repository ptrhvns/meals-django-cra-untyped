import App from "./App";
import ReactDOM from "react-dom";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";

function buildComponent() {
  return (
    <HelmetProvider>
      <MemoryRouter>
        <App />
      </MemoryRouter>
    </HelmetProvider>
  );
}

it("renders successfully", () => {
  const div = document.createElement("div");
  ReactDOM.render(buildComponent(), div);
});
