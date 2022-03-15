import ReactDOM from "react-dom";
import RecipeTimesList from "./RecipeTimesList";
import { render } from "@testing-library/react";

function buildComponent(props = {}) {
  props = {
    recipeState: { recipe_times: [] },
    ...props,
  };
  return <RecipeTimesList {...props} />;
}

it("renders successfully", () => {
  const div = document.createElement("div");
  ReactDOM.render(buildComponent(), div);
});

describe("when there are no recipe times", () => {
  it("renders an 'empty' notice", () => {
    const { queryByText } = render(
      buildComponent({ recipeState: { recipe_times: [] } })
    );
    expect(queryByText("No times have been created yet.")).toBeTruthy();
  });
});

describe("when there are recipe times", () => {
  it("renders a list of the recipe times", async () => {
    const recipe_times = [
      {
        days: "1",
        hours: "1",
        id: 1,
        minutes: "1",
        time_type: "Cook",
      },
      {
        days: "2",
        hours: "2",
        minutes: "2",
        id: 2,
        time_type: "Preparation",
      },
    ];
    const { findAllByRole } = render(
      buildComponent({ recipeState: { recipe_times } })
    );
    const listItems = await findAllByRole("listitem");
    expect(listItems).toHaveLength(2);
  });
});
