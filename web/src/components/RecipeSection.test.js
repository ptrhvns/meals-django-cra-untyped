import RecipeSection from "./RecipeSection";
import { createRoot } from "react-dom/client";
import { merge } from "lodash";

function buildComponent(props = {}) {
  props = merge({ children: <div /> }, props);
  return <RecipeSection {...props} />;
}

it("renders successfully", () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  root.render(buildComponent());
});
