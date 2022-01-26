import ReactDOM from "react-dom";
import App from "./App";

it("renders successfully", () => {
  const div = document.createElement("div");
  ReactDOM.render(<App />, div);
});
