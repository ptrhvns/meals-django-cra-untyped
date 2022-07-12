import RecipeTimes from "./RecipeTimes";
import { act, render, screen } from "@testing-library/react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { merge } from "lodash";

function buildComponent(props = {}) {
  props = merge({ data: { id: 1 } }, props);

  return (
    <MemoryRouter>
      <RecipeTimes {...props} />
    </MemoryRouter>
  );
}

it("renders successfully", () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  act(() => root.render(buildComponent()));
});

describe("when data.recipe_times is empty", () => {
  it("renders and empty notice", () => {
    render(buildComponent({ data: { recipe_times: [] } }));
    expect(screen.queryByText("Times haven't been created yet.")).toBeTruthy();
  });
});

describe("when data.recipe_times is present", () => {
  it("renders a sorted list of times", () => {
    const recipe_times = [
      {
        days: "5",
        hours: "4",
        id: 1,
        minutes: "3",
        note: "Cook test note",
        time_type: "Cook",
      },
      {
        time_type: "Additional",
        days: "5",
        hours: "4",
        id: 2,
        minutes: "3",
        note: "Additional test note",
      },
    ];
    render(buildComponent({ data: { recipe_times } }));
    const actualTimes = screen.queryAllByTestId("recipe-times__list-item");
    expect(actualTimes.length).toEqual(recipe_times.length);
    expect(actualTimes[0].textContent).toEqual(
      "Additional:5d 4h 3m(Additional test note)"
    );
    expect(actualTimes[1].textContent).toEqual("Cook:5d 4h 3m(Cook test note)");
  });
});
