import RecipeSectionContent from "./RecipeSectionContent";
import { act, render, screen } from "@testing-library/react";
import { createRoot } from "react-dom/client";

function buildComponent(props = {}) {
  return <RecipeSectionContent {...props} />;
}

it("renders successfully", () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  act(() => root.render(buildComponent()));
});

describe("when data prop is present", () => {
  it("renders children prop function", () => {
    render(
      buildComponent({
        data: { test: "content" },
        children: () => <div data-testid="test-id" />,
      })
    );

    expect(screen.queryByTestId("test-id")).toBeTruthy();
  });
});
