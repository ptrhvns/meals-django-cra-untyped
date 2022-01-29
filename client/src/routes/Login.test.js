import Login from "./Login";
import ReactDOM from "react-dom";
import { HelmetProvider } from "react-helmet-async";
import { render, waitFor } from "@testing-library/react";

function buildComponent() {
  return (
    <HelmetProvider>
      <Login />
    </HelmetProvider>
  );
}

it("renders successfully", () => {
  const div = document.createElement("div");
  ReactDOM.render(buildComponent(), div);
});

it("renders the correct <title>", async () => {
  const component = render(buildComponent());
  await waitFor(() => expect(document.title).toContain("Login"));
});
