import ReactDOM from "react-dom";
import Signup from "./Signup";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { render, waitFor } from "@testing-library/react";

function buildComponent() {
  return (
    <MemoryRouter>
      <HelmetProvider>
        <Signup />
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
  await waitFor(() => expect(document.title).toContain("Create Account"));
});