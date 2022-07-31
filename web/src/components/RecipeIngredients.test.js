import RecipeIngredients from "./RecipeIngredients";
import { act, render, screen, within } from "@testing-library/react";
import { compact, join, merge, pick } from "lodash";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";

function buildComponent(props = {}) {
  props = merge({ data: { id: 7 } }, props);

  return (
    <MemoryRouter>
      <RecipeIngredients {...props} />
    </MemoryRouter>
  );
}

it("renders successfully", () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  act(() => root.render(buildComponent()));
});

describe("when data.ingredients prop is present", () => {
  it("renders ingredients", () => {
    const ingredients = [
      {
        id: 1,
        amount: "1",
        brand: { name: "Acme" },
        unit: { name: "cup" },
        description: { text: "sugar" },
      },
    ];

    render(buildComponent({ data: { ingredients } }));

    const li = screen.getByTestId("recipe-ingredients__list-item-0");

    within(li, () =>
      expect(
        screen.queryByText(
          join(
            compact(
              pick(ingredients, ["amount", "unit", "brand", "description"])
            ),
            " "
          )
        )
      ).toBeTruthy()
    );
  });
});
