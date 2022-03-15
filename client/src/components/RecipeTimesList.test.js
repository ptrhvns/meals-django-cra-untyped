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
