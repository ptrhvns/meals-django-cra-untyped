jest.mock("../lib/api", () => ({ get: jest.fn() }));

import AuthnProvider from "../providers/AuthnProvider";
import ReactDOM from "react-dom";
import Recipe from "./Recipe";
import { get } from "../lib/api";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";

function buildComponent(props = {}) {
  return (
    <HelmetProvider>
      <MemoryRouter>
        <AuthnProvider>
          <Recipe {...props} />
        </AuthnProvider>
      </MemoryRouter>
    </HelmetProvider>
  );
}

it("renders successfully", () => {
  const div = document.createElement("div");
  ReactDOM.render(buildComponent(), div);
});

describe("when recipe data is undefined", () => {
  it("renders a generic <title>", async () => {
    get.mockReturnValue(new Promise(() => {}));
    render(buildComponent());
    await waitFor(() => expect(document.title).toContain("Recipe"));
  });
});

describe("when recipe data has been retrieved", () => {
  it("renders recipe data", async () => {
    get.mockResolvedValue({ data: { id: 1, title: "Test Title" } });
    render(buildComponent());
    await waitFor(() =>
      expect(screen.queryByTestId("recipe-loaded-content")).toBeTruthy()
    );
  });
});
