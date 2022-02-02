import FullPageCard from "./FullPageCard";
import ReactDOM from "react-dom";
import { MemoryRouter } from "react-router-dom";

function buildComponent({ children = <div>test children</div> } = {}) {
  return (
    <MemoryRouter>
      <FullPageCard>{children}</FullPageCard>
    </MemoryRouter>
  );
}

it("renders successfully", () => {
  const div = document.createElement("div");
  ReactDOM.render(buildComponent(), div);
});
