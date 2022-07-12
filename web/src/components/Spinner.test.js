import Spinner from "./Spinner";
import { createRoot } from "react-dom/client";

function buildComponent(props = {}) {
  props = { children: <div>test</div>, spin: false, ...props };
  return <Spinner {...props} />;
}

it("renders successfully", () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  root.render(buildComponent());
});
