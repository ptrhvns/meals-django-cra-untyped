import AuthnProvider from "../providers/AuthnProvider";
import PageLayout from "./PageLayout";
import { act, render, screen } from "@testing-library/react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { merge } from "lodash";

function buildComponent(props = {}) {
  props = merge({ children: <div /> }, props);

  return (
    <MemoryRouter>
      <AuthnProvider>
        <PageLayout {...props} />
      </AuthnProvider>
    </MemoryRouter>
  );
}

it("renders successfully", () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  act(() => root.render(buildComponent()));
});

it("renders contentClassName", async () => {
  const contentClassName = "test-class";
  render(buildComponent({ contentClassName }));
  const div = screen.getByTestId("page-layout__content");
  expect(div.className).toContain(contentClassName);
});
