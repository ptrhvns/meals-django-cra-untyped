import ReactDOM from "react-dom";
import RecipeTags from "./RecipeTags";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";

function buildComponent(props = {}) {
  props = { data: { recipe_times: [] }, ...props };

  return (
    <MemoryRouter>
      <RecipeTags {...props} />
    </MemoryRouter>
  );
}

it("renders successfully", () => {
  const div = document.createElement("div");
  ReactDOM.render(buildComponent(), div);
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
