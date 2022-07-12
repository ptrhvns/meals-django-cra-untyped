import RecipeRating from "./RecipeRating";
import { act, render, screen } from "@testing-library/react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { merge } from "lodash";

function buildComponent(props = {}) {
  props = merge({ data: { id: 1, rating: 5 } }, props);

  return (
    <MemoryRouter>
      <RecipeRating {...props} />
    </MemoryRouter>
  );
}

it("renders successfully", () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  act(() => root.render(buildComponent()));
});

describe("when rating is missing", () => {
  it("renders a default message", async () => {
    render(buildComponent({ data: { rating: null } }));
    expect(screen.queryByText("Rating hasn't been set yet.")).toBeTruthy();
  });
});

describe("when rating exists", () => {
  it("renders given star rating", () => {
    render(buildComponent({ data: { rating: 3 } }));
    expect(screen.queryByTestId("recipe-rating__content")).toBeTruthy();
    expect(screen.queryAllByTestId("recipe-rating__star-on").length).toEqual(3);
  });
});
