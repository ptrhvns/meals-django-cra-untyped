import ReactDOM from "react-dom";
import RecipeTitle from "./RecipeTitle";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";

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
  const div = document.createElement("div");
  ReactDOM.render(buildComponent(), div);
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
