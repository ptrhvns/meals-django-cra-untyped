import Alert from "./Alert";
import userEvent from "@testing-library/user-event";
import { act, render } from "@testing-library/react";
import { createRoot } from "react-dom/client";

function buildComponent(props = {}) {
  props = { children: <div>test</div>, variant: "info", ...props };
  return <Alert {...props} />;
}

it("renders successfully", () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  act(() => root.render(buildComponent()));
});

it("renders alert-<variant> className", () => {
  const { container } = render(buildComponent({ variant: "error" }));
  expect(container.firstChild.className).toContain("alert-error");
});

it("renders className prop", () => {
  const { container } = render(buildComponent({ className: "test-class" }));
  expect(container.firstChild.className).toContain("test-class");
});

it("renders children prop", () => {
  const children = <div data-testid="test-children">test</div>;
  const { getByTestId } = render(buildComponent({ children }));
  getByTestId("test-children");
});

describe("when onDismiss prop is present", () => {
  it("renders dismiss button which calls onDismiss on click", async () => {
    const user = userEvent.setup();
    const onDismiss = jest.fn();
    const { getByRole } = render(buildComponent({ onDismiss }));
    await user.click(getByRole("button", { hidden: true, name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalled();
  });
});
