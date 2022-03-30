import FieldError from "./FieldError";
import ReactDOM from "react-dom";
import { render, screen } from "@testing-library/react";

function buildComponent(props = {}) {
  return <FieldError {...props} />;
}

it("renders successfully", () => {
  const div = document.createElement("div");
  ReactDOM.render(buildComponent(), div);
});

describe("when error prop is given", () => {
  it("renders error", () => {
    render(buildComponent({ error: "test error" }));
    expect(screen.queryByText("test error")).toBeTruthy();
  });

  describe("when className prop is given", () => {
    it("renders className", () => {
      const { container } = render(
        buildComponent({ error: "test error", className: "test-classname" })
      );
      expect(container.firstChild.className).toContain("test-classname");
    });
  });
});

describe("when error prop is not given", () => {
  it("renders null", () => {
    const { container } = render(buildComponent({ error: null }));
    expect(container).toBeEmptyDOMElement();
  });
});
