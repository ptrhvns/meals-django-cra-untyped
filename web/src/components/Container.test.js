import Container from "./Container";
import ReactDOM from "react-dom";
import { render } from "@testing-library/react";

function buildComponent(props = {}) {
  props = { children: <div>test</div>, variant: "content", ...props };
  return <Container {...props} />;
}

it("renders successfully", () => {
  const div = document.createElement("div");
  ReactDOM.render(buildComponent(), div);
});

it("renders className prop", () => {
  const { container } = render(buildComponent({ className: "test" }));
  expect(container.firstChild.className).toContain("test");
});

it("renders variant as className", () => {
  const { container } = render(buildComponent({ variant: "viewport" }));
  expect(container.firstChild.className).toContain("container-viewport");
});
