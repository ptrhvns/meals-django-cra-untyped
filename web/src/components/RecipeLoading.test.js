import RecipeLoading from "./RecipeLoading";
import { act, render, screen } from "@testing-library/react";
import { createRoot } from "react-dom/client";

function buildComponent(props = {}) {
  props = {
    children: () => <div>Test</div>,
    isLoading: false,
    ...props,
  };
  return <RecipeLoading {...props} />;
}

it("renders successfully", () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  act(() => root.render(buildComponent()));
});

describe("when isLoading prop is true", () => {
  it("renders component's className", () => {
    const { container } = render(buildComponent({ isLoading: true }));
    expect(container.firstChild.className).toContain("recipe-loading");
  });

  it("renders className prop", () => {
    const className = "test-class";
    const { container } = render(
      buildComponent({ className, isLoading: true })
    );
    expect(container.firstChild.className).toContain(className);
  });

  it("renders loading message", () => {
    render(buildComponent({ isLoading: true }));
    expect(screen.queryByText("Loading")).toBeTruthy();
  });
});

describe("when error prop is given", () => {
  it("renders component's className", () => {
    const { container } = render(buildComponent({ error: "Test error." }));
    expect(container.firstChild.className).toContain("recipe-loading");
  });

  it("renders className prop", () => {
    const className = "test-class";
    const { container } = render(
      buildComponent({ className, error: "Test error." })
    );
    expect(container.firstChild.className).toContain(className);
  });

  it("renders error prop", () => {
    const error = "test error";
    render(buildComponent({ error }));
    expect(screen.queryByText(error)).toBeTruthy();
  });
});

describe("when not loading, or given an error prop", () => {
  it("renders children prop", () => {
    const children = () => <div data-testid="test-marker">Test children.</div>;
    render(buildComponent({ children }));
    expect(screen.queryByTestId("test-marker")).toBeTruthy();
  });
});
