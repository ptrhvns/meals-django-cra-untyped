import RecipeServings from "./RecipeServings";
import { act, render, screen } from "@testing-library/react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { merge } from "lodash";

function buildComponent(props = {}) {
  props = merge({ data: { id: 1 } }, props);

  return (
    <MemoryRouter>
      <RecipeServings {...props} />
    </MemoryRouter>
  );
}

it("renders successfully", () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  act(() => root.render(buildComponent()));
});

describe("when servings is missing from data prop", () => {
  it("renders empty notice", () => {
    render(buildComponent({ data: { servings: null } }));
    expect(screen.queryByText("Servings hasn't been set yet.")).toBeTruthy();
  });
});

describe("when servings is present in data prop", () => {
  describe("when servings ends in '.00'", () => {
    it("renders servings without decimal places", () => {
      const servings = 4.0;
      render(buildComponent({ data: { servings } }));
      expect(screen.queryByText("Total:")).toBeTruthy();
      expect(screen.queryByText(Math.floor(servings))).toBeTruthy();
    });
  });

  describe("when servings does not end in '.00'", () => {
    it("renders servings with decimal places", () => {
      const servings = 4.75;
      render(buildComponent({ data: { servings } }));
      expect(screen.queryByText("Total:")).toBeTruthy();
      expect(screen.queryByText(servings)).toBeTruthy();
    });
  });
});
