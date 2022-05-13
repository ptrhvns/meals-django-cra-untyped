import ReactDOM from "react-dom";
import RecipeRating from "./RecipeRating";
import { MemoryRouter } from "react-router-dom";
import { merge } from "lodash";

function buildComponent(props = {}) {
  props = merge({ data: { id: 1, rating: 5 } }, props);

  return (
    <MemoryRouter>
      <RecipeRating {...props} />
    </MemoryRouter>
  );
}

it("renders successfully", () => {
  const div = document.createElement("div");
  ReactDOM.render(buildComponent(), div);
});
