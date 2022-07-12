import RecipeTitle from "./RecipeTitle";
import { act, render, screen } from "@testing-library/react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";

function buildComponent(props = {}) {
  props = {
    data: {
      id: 1,
      title: "Best Cookies Ever",
    },
    ...props,
  };

  return (
    <MemoryRouter>
      <RecipeTitle {...props} />
    </MemoryRouter>
  );
}

it("renders successfully", () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  act(() => root.render(buildComponent()));
});

it("renders data.title prop", () => {
  const title = "Test Title";
  render(buildComponent({ data: { id: 1, title } }));
  expect(screen.queryByText(title)).toBeTruthy();
});

it("renders edit link using data.id prop", () => {
  const recipeId = 1;
  render(buildComponent({ data: { id: recipeId, title: "Test Title" } }));
  expect(screen.getByRole("link").href).toMatch(
    new RegExp(`/recipe/${recipeId}/title/edit$`)
  );
});
