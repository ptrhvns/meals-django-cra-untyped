import Dashboard from "./Dashboard";
import ReactDOM from "react-dom";

function buildComponent() {
  return <Dashboard />;
}

it("renders successfully", () => {
  const div = document.createElement("div");
  ReactDOM.render(buildComponent(), div);
});
