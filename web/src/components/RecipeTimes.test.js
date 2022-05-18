import ReactDOM from "react-dom";
import RecipeTimes from "./RecipeTimes";
import { MemoryRouter } from "react-router-dom";
import { merge } from "lodash";
import { render, screen } from "@testing-library/react";

function buildComponent(props = {}) {
  props = merge({ data: { id: 1 } }, props);

  return (
    <MemoryRouter>
      <RecipeTimes {...props} />
    </MemoryRouter>
  );
}

it("renders successfully", () => {
  const div = document.createElement("div");
  ReactDOM.render(buildComponent(), div);
});

describe("when data.recipe_times is empty", () => {
  it("renders and empty notice", () => {
    render(buildComponent({ data: { recipe_times: [] } }));
    expect(screen.queryByText("No times have been created yet.")).toBeTruthy();
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
