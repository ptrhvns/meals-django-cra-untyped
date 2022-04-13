import ReactDOM from "react-dom";
import Spinner from "./Spinner";

function buildComponent(props = {}) {
  props = { children: <div>test</div>, spin: false, ...props };
  return <Spinner {...props} />;
}

it("renders successfully", () => {
  const div = document.createElement("div");
  ReactDOM.render(buildComponent(), div);
});
