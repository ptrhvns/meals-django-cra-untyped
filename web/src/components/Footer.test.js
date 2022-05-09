import Footer from "./Footer";
import ReactDOM from "react-dom";

function buildComponent(props = {}) {
  return <Footer {...props} />;
}

it("renders successfully", () => {
  const div = document.createElement("div");
  ReactDOM.render(buildComponent(), div);
});
