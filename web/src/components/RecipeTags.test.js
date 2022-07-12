import RecipeTags from "./RecipeTags";
import { act, render, screen } from "@testing-library/react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { merge } from "lodash";

function buildComponent(props = {}) {
  props = merge({ data: { id: 1, recipe_times: [] } }, props);

  return (
    <MemoryRouter>
      <RecipeTags {...props} />
    </MemoryRouter>
  );
}

it("renders successfully", () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  act(() => root.render(buildComponent()));
});

it("renders data.recipe_tags prop", () => {
  const recipe_tags = [
    { id: 1, name: "Tag#1" },
    { id: 2, name: "Tag#2" },
  ];
  render(buildComponent({ data: { recipe_tags } }));
  recipe_tags.forEach((rt) => {
    expect(screen.queryByText(rt.name)).toBeTruthy();
  });
});
