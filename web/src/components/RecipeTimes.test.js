import ReactDOM from "react-dom";
import RecipeTimes from "./RecipeTimes";

function buildComponent(props = {}) {
  return <RecipeTimes {...props} />;
}

it("renders successfully", () => {
  const div = document.createElement("div");
  ReactDOM.render(buildComponent(), div);
});
