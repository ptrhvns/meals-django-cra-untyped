import Footer from "./Footer";
import { createRoot } from "react-dom/client";

function buildComponent(props = {}) {
  return <Footer {...props} />;
}

it("renders successfully", () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  root.render(buildComponent());
});
