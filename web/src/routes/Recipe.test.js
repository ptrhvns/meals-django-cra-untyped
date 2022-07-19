jest.mock("../hooks/useApi", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("../components/RecipeEquipment", () => ({
  __esModule: true,
  default: jest.fn(() => <div />),
}));

jest.mock("../components/RecipeNotes", () => ({
  __esModule: true,
  default: jest.fn(() => <div />),
}));

jest.mock("../components/RecipeRating", () => ({
  __esModule: true,
  default: jest.fn(() => <div />),
}));

jest.mock("../components/RecipeServings", () => ({
  __esModule: true,
  default: jest.fn(() => <div />),
}));

jest.mock("../components/RecipeTags", () => ({
  __esModule: true,
  default: jest.fn(() => <div />),
}));

jest.mock("../components/RecipeTimes", () => ({
  __esModule: true,
  default: jest.fn(() => <div />),
}));

jest.mock("../components/RecipeTitle", () => ({
  __esModule: true,
  default: jest.fn(() => <div />),
}));

import AuthnProvider from "../providers/AuthnProvider";
import Recipe from "./Recipe";
import RecipeNotes from "../components/RecipeNotes";
import RecipeRating from "../components/RecipeRating";
import RecipeServings from "../components/RecipeServings";
import RecipeTags from "../components/RecipeTags";
import RecipeTimes from "../components/RecipeTimes";
import RecipeTitle from "../components/RecipeTitle";
import useApi from "../hooks/useApi";
import { act, render, screen, waitFor } from "@testing-library/react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";

function buildComponent(props = {}) {
  return (
    <HelmetProvider>
      <MemoryRouter>
        <AuthnProvider>
          <Recipe {...props} />
        </AuthnProvider>
      </MemoryRouter>
    </HelmetProvider>
  );
}

const get = jest.fn();

beforeEach(() => {
  get.mockResolvedValue({});
  useApi.mockReturnValue({ get });
});

it("renders successfully", async () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  await act(async () => root.render(buildComponent()));
});

describe("when recipe data is undefined", () => {
  it("renders a generic <title>", async () => {
    get.mockReturnValue(new Promise(() => {}));
    render(buildComponent());
    await waitFor(() => expect(document.title).toContain("Recipe"));
  });
});

describe("when recipe data has been retrieved", () => {
  it("renders recipe data", async () => {
    get.mockResolvedValue({ data: { id: 1, title: "Test Title" } });
    render(buildComponent());
    await waitFor(() =>
      expect(screen.queryByTestId("recipe-loaded-content")).toBeTruthy()
    );
  });
});
