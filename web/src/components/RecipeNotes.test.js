import ReactDOM from "react-dom";
import RecipeNotes from "./RecipeNotes";
import { MemoryRouter } from "react-router-dom";
import { merge } from "lodash";
import { render, screen } from "@testing-library/react";

function buildComponent(props = {}) {
  props = merge({ data: { id: 1 } }, props);

  return (
    <MemoryRouter>
      <RecipeNotes {...props} />
    </MemoryRouter>
  );
}

it("renders successfully", () => {
  const div = document.createElement("div");
  ReactDOM.render(buildComponent(), div);
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
