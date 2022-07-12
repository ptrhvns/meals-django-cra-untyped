import RecipeNotes from "./RecipeNotes";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { merge } from "lodash";
import { act, render, screen } from "@testing-library/react";

function buildComponent(props = {}) {
  props = merge({ data: { id: 1 } }, props);

  return (
    <MemoryRouter>
      <RecipeNotes {...props} />
    </MemoryRouter>
  );
}

it("renders successfully", async () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  await act(() => root.render(buildComponent()));
});

describe("when notes is missing from data prop", () => {
  it("renders empty notice", () => {
    render(buildComponent({ data: { notes: null } }));
    expect(screen.queryByText("Notes hasn't been set yet.")).toBeTruthy();
  });
});

describe("when notes is present in data prop", () => {
  it("renders notes", () => {
    const notes = "This is a test note.";
    render(buildComponent({ data: { notes } }));
    expect(screen.queryByText(notes)).toBeTruthy();
  });
});
