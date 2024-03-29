jest.mock("../hooks/useApi", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock("../components/AsyncAutocomplete");

import AsyncAutocomplete from "../components/AsyncAutocomplete";
import AuthnProvider from "../providers/AuthnProvider";
import RecipeEquipmentCreateForm from "./RecipeEquipmentCreateForm";
import useApi from "../hooks/useApi";
import userEvent from "@testing-library/user-event";
import { act, render, screen, waitFor } from "@testing-library/react";
import { createRoot } from "react-dom/client";
import { head } from "lodash";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter, useNavigate, useParams } from "react-router-dom";
import { within } from "@testing-library/dom";

function buildComponent() {
  return (
    <HelmetProvider>
      <MemoryRouter>
        <AuthnProvider>
          <RecipeEquipmentCreateForm />
        </AuthnProvider>
      </MemoryRouter>
    </HelmetProvider>
  );
}

async function fillOutAndSubmitForm(user) {
  // AsyncAutocomplete is mocked out, so no need to fill out input.
  await user.click(screen.getByRole("button", { name: "Save" }));
}

const get = jest.fn();
const post = jest.fn();
let navigate;

beforeEach(() => {
  AsyncAutocomplete.mockReturnValue(<div />);
  get.mockResolvedValue({ data: { matches: [] } });
  post.mockResolvedValue({});
  useApi.mockReturnValue({ get, post });
  navigate = jest.fn();
  useNavigate.mockReturnValue(navigate);
  useParams.mockReturnValue({ recipeId: 1 });
});

it("renders successfully", () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  act(() => root.render(buildComponent()));
});

it("renders correct <title>", async () => {
  render(buildComponent());
  await waitFor(() => expect(document.title).toContain("New Recipe Equipment"));
});

describe("when user submits form", () => {
  describe("when API responds with a general error", () => {
    it("renders that error as dismissable", async () => {
      const user = userEvent.setup();
      const message = "Test error.";
      post.mockReturnValue(Promise.resolve({ isError: true, message }));
      render(buildComponent());
      await fillOutAndSubmitForm(user);
      expect(screen.queryByText(message)).toBeTruthy();
      const alert = screen.getByTestId("alert");
      await user.click(within(alert).getByRole("button", { name: "Dismiss" }));
      expect(screen.queryByText(message)).not.toBeTruthy();
    });
  });

  describe("when API responds with field error", () => {
    it("renders that error", async () => {
      const user = userEvent.setup();
      const errors = { description: ["Description is invalid."] };
      post.mockResolvedValue({
        errors,
        isError: true,
        message: "An error occurred.",
      });
      render(buildComponent());
      await fillOutAndSubmitForm(user);
      expect(screen.queryByText(head(errors.description))).toBeTruthy();
    });
  });

  describe("when API responds with success", () => {
    it("navigates user to recipe", async () => {
      const user = userEvent.setup();
      const recipeId = 7;
      useParams.mockReturnValue({ recipeId });
      post.mockResolvedValue({});
      render(buildComponent());
      await fillOutAndSubmitForm(user);
      expect(navigate).toHaveBeenCalledWith(`/recipe/${recipeId}`, {
        replace: true,
      });
    });
  });
});

describe("when getEquipmentMatches is called", () => {
  it("it sends search to API", () => {
    const matches = ["TestMatch1", "TestMatch2"];
    get.mockResolvedValue({ data: { matches } });
    render(buildComponent());
    const getMatches = AsyncAutocomplete.mock.lastCall[0].getMatches;
    const searchTerm = "TestMatch";
    getMatches(searchTerm, jest.fn());
    expect(get).toHaveBeenCalledWith({
      route: "recipeEquipmentSearch",
      routeData: { searchTerm },
    });
  });

  describe("when API responds with error", () => {
    it("calls setMatches with empty array", async () => {
      get.mockResolvedValue({ isError: true });
      render(buildComponent());
      const getMatches = AsyncAutocomplete.mock.lastCall[0].getMatches;
      const setMatches = jest.fn();
      getMatches("TestMatch", setMatches);
      await waitFor(() => expect(setMatches).toHaveBeenCalledWith([]));
    });
  });

  describe("when API responds with success", () => {
    it("call setMatches with value of matches", async () => {
      const matches = ["TestMatch1", "TestMatch2"];
      get.mockResolvedValue({ data: { matches } });
      render(buildComponent());
      const getMatches = AsyncAutocomplete.mock.lastCall[0].getMatches;
      const setMatches = jest.fn();
      getMatches("TestMatch", setMatches);
      await waitFor(() => expect(setMatches).toHaveBeenCalledWith(matches));
    });
  });
});
