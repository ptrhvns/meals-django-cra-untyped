import RecipeEquipment from "./RecipeEquipment";
import { act, render, screen } from "@testing-library/react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { merge } from "lodash";

function buildComponent(props = {}) {
  props = merge({ data: { id: 1 } }, props);

  return (
    <MemoryRouter>
      <RecipeEquipment {...props} />
    </MemoryRouter>
  );
}

it("renders successfully", () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  act(() => root.render(buildComponent()));
});

describe("when recipe_equipment prop is missing", () => {
  it("renders an empty notice", () => {
    render(buildComponent({ data: { recipe_equipment: [] } }));
    expect(
      screen.queryByText("Equipment hasn't been created yet.")
    ).toBeTruthy();
  });
});

describe("when recipe_equipment prop is present", () => {
  it("renders the list of recipe equipment", () => {
    const description = "Test description";
    render(
      buildComponent({ data: { recipe_equipment: [{ id: 7, description }] } })
    );
    expect(screen.queryByText(description)).toBeTruthy();
  });
});
