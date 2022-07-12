import Container from "./Container";
import { act, render } from "@testing-library/react";
import { createRoot } from "react-dom/client";

function buildComponent(props = {}) {
  props = { children: <div>test</div>, variant: "content", ...props };
  return <Container {...props} />;
}

it("renders successfully", () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  act(() => root.render(buildComponent()));
});

it("renders className prop", () => {
  const { container } = render(buildComponent({ className: "test" }));
  expect(container.firstChild.className).toContain("test");
});

it("renders variant as className", () => {
  const { container } = render(buildComponent({ variant: "viewport" }));
  expect(container.firstChild.className).toContain("container-viewport");
});
