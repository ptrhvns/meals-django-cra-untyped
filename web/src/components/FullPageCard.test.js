import FullPageCard from "./FullPageCard";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";

function buildComponent({ children = <div>test children</div> } = {}) {
  return (
    <MemoryRouter>
      <FullPageCard>{children}</FullPageCard>
    </MemoryRouter>
  );
}

it("renders successfully", () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  root.render(buildComponent());
});
