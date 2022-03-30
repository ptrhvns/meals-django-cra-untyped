import FieldError from "./FieldError";
import ReactDOM from "react-dom";

function buildComponent(props = {}) {
  return <FieldError {...props} />;
}

it("renders successfully", () => {
  const div = document.createElement("div");
  ReactDOM.render(buildComponent(), div);
});

describe("when error is given", () => {
  it.todo("renders error");
});

describe("when error is not given", () => {
  it.todo("renders null");
});
