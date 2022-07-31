import RecipeSectionEmptyContent from "./RecipeSectionEmptyContent";
import { createRoot } from "react-dom/client";

function buildComponent(props = {}) {
  return <RecipeSectionEmptyContent {...props} />;
}

it("renders successfully", () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  root.render(buildComponent());
});
