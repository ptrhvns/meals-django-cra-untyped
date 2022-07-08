import ReactDOM from "react-dom";
import RecipeServings from "./RecipeServings";
import { MemoryRouter } from "react-router-dom";
import { merge } from "lodash";
import { render, screen } from "@testing-library/react";

function buildComponent(props = {}) {
  props = merge({ data: { id: 1 } }, props);

  return (
    <MemoryRouter>
      <RecipeServings {...props} />
    </MemoryRouter>
  );
}

it("renders successfully", () => {
  const div = document.createElement("div");
  ReactDOM.render(buildComponent(), div);
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
      const servings = 4.00;
      render(buildComponent({ data: { servings } }));
      expect(screen.queryByText("Servings:")).toBeTruthy();
      expect(screen.queryByText(Math.floor(servings))).toBeTruthy();
    });
  });

  describe("when servings does not end in '.00'", () => {
    it("renders servings with decimal places", () => {
      const servings = 4.75;
      render(buildComponent({ data: { servings } }));
      expect(screen.queryByText("Servings:")).toBeTruthy();
      expect(screen.queryByText(servings)).toBeTruthy();
    });
  });
});
