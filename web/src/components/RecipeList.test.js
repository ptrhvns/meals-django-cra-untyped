jest.mock("../hooks/useApi", () => ({
  __esModule: true,
  default: jest.fn(),
}));

import RecipeList from "./RecipeList";
import useApi from "../hooks/useApi";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";

function buildComponent(props = {}) {
  return (
    <MemoryRouter>
      <RecipeList {...props} />
    </MemoryRouter>
  );
}

const get = jest.fn();

beforeEach(() => {
  get.mockResolvedValue({ data: [{ id: 1, title: "Test Title" }] });
  useApi.mockReturnValue({ get });
});

it("renders successfully", async () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  await act(() => root.render(buildComponent()));
});

it("renders loading status appropriately throughout", async () => {
  get.mockReturnValue(new Promise(() => {}));
  await act(async () => render(buildComponent()));
  await waitFor(() =>
    expect(screen.queryByText("Loading recipes")).toBeTruthy()
  );
});

describe("when there's an error loading recipes", () => {
  it("renders the loading error", async () => {
    const error = "test error";
    get.mockResolvedValue({ isError: true, message: error });
    await act(async () => render(buildComponent()));
    expect(screen.queryByText(error)).toBeTruthy();
  });
});

describe("when the API returns an empty list of recipes", () => {
  it("renders an empty list message", async () => {
    get.mockResolvedValue({ data: [] });
    await act(async () => render(buildComponent()));
    expect(
      screen.queryByText("No recipes have been created yet.")
    ).toBeTruthy();
  });
});

describe("when the API returns a non-empty list of recipes", () => {
  it("renders list of recipe titles as links", async () => {
    const recipes = [
      { id: 1, title: "Recipe #1" },
      { id: 2, title: "Recipe #2" },
    ];
    get.mockResolvedValue({ data: recipes });
    let container;
    await act(async () => {
      container = render(buildComponent());
    });
    const recipeList = container.getByTestId("recipe-list__list");
    const links = within(recipeList).queryAllByRole("link");
    expect(links.map((l) => l.text)).toEqual(recipes.map((r) => r.title));
  });
});
