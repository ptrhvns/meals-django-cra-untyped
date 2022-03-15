import RecipeTimes from "./RecipeTimes";
import ReactDOM from "react-dom";

function buildComponent(props = {}) {
  props = {
    recipeDispatch: jest.fn(),
    recipeState: {},
    ...props,
  };
  return <RecipeTimes {...props} />;
}

it("renders successfully", () => {
  const div = document.createElement("div");
  ReactDOM.render(buildComponent(), div);
});
