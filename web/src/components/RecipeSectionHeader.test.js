import RecipeSectionHeader from "./RecipeSectionHeader";
import { createRoot } from "react-dom/client";
import { merge } from "lodash";

function buildComponent(props = {}) {
  props = merge(
    { headerText: "Test Header", linkText: "Test Link", linkTo: "/example" },
    props
  );

  return <RecipeSectionHeader {...props} />;
}

it("renders successfully", () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  root.render(buildComponent());
});
