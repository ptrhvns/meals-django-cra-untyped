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
import RecipeIngredientEditForm from "./RecipeIngredientEditForm";
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
          <RecipeIngredientEditForm />
        </AuthnProvider>
      </MemoryRouter>
    </HelmetProvider>
  );
}

async function renderAndWaitUntilReady(component) {
  render(component);
  await waitFor(() => screen.getByTestId("recipe-ingredient-edit-form__form"));
}

const get = jest.fn();
const post = jest.fn();
let navigate;

beforeEach(() => {
  get.mockImplementation((args) =>
    args.route.endsWith("Search")
      ? Promise.resolve({ data: { matches: [] } })
      : Promise.resolve({ data: { description: "TestIngredient" } })
  );
  post.mockResolvedValue({});
  useApi.mockReturnValue({ get, post });
  navigate = jest.fn();
  useNavigate.mockReturnValue(navigate);
  useParams.mockReturnValue({ recipeId: 1 });
});

it("renders successfully", async () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  await act(async () => root.render(buildComponent()));
});

it("renders correct <title>", async () => {
  await renderAndWaitUntilReady(buildComponent());
  await waitFor(() =>
    expect(document.title).toContain("Edit Recipe Ingredient")
  );
});

describe("when user submits form", () => {
  async function fillOutAndSubmitForm(
    user,
    {
      amount = "1",
      // brand = "Acme",
      // description = "test ingredient",
      // unit = "cup",
    } = {}
  ) {
    await user.type(screen.getByLabelText("Amount"), amount);
    // await user.type(screen.getByLabelText("Brand"), brand);
    // await user.type(screen.getByLabelText("Description"), description);
    // await user.type(screen.getByLabelText("Unit"), unit);
    await user.click(screen.getByRole("button", { name: "Save" }));
  }

  describe("when API responds with general error", () => {
    it("renders dismissable alert with that general error", async () => {
      const user = userEvent.setup();
      const message = "Test error.";
      post.mockResolvedValue({ isError: true, message });
      await renderAndWaitUntilReady(buildComponent());
      await fillOutAndSubmitForm(user);
      expect(screen.queryByText(message)).toBeTruthy();
      const alert = screen.getByTestId("alert");
      await user.click(within(alert).getByRole("button", { name: "Dismiss" }));
      expect(screen.queryByText(message)).not.toBeTruthy();
    });
  });

  describe("when API responds with field errors", () => {
    it("renders those field errors", async () => {
      const user = userEvent.setup();
      const errors = {
        amount: ["Amount is invalid."],
        brand: ["Brand is invalid."],
        description: ["Description is invalid."],
        unit: ["Unit is invalid."],
      };
      post.mockResolvedValue({
        errors,
        isError: true,
        message: "An error occurred.",
      });
      await renderAndWaitUntilReady(buildComponent());
      await fillOutAndSubmitForm(user);
      expect(screen.queryByText(head(errors.amount))).toBeTruthy();
      expect(screen.queryByText(head(errors.brand))).toBeTruthy();
      expect(screen.queryByText(head(errors.description))).toBeTruthy();
      expect(screen.queryByText(head(errors.unit))).toBeTruthy();
    });
  });

  describe("when API responds with success", () => {
    it("navigates user to recipe", async () => {
      const user = userEvent.setup();
      const recipeId = 7;
      useParams.mockReturnValue({ recipeId });
      await renderAndWaitUntilReady(buildComponent());
      await fillOutAndSubmitForm(user);
      expect(navigate).toHaveBeenCalledWith(`/recipe/${recipeId}`);
    });
  });
});

describe("when user deletes ingredient", () => {
  describe("when user does not confirm deletion", () => {
    it("does not send deletion request to API", async () => {
      const user = userEvent.setup();
      window.confirm = jest.fn(() => false);
      await renderAndWaitUntilReady(buildComponent());
      await user.click(screen.getByRole("button", { name: "Delete" }));
      expect(post).not.toHaveBeenCalled();
    });
  });

  describe("when user confirms deletion", () => {
    describe("when API responds with general error", () => {
      it("renders dismissable alert with that general error", async () => {
        const user = userEvent.setup();
        window.confirm = jest.fn(() => true);
        const message = "Test error.";
        post.mockResolvedValue({ isError: true, message });
        await renderAndWaitUntilReady(buildComponent());
        await user.click(screen.getByRole("button", { name: "Delete" }));
        expect(screen.queryByText(message)).toBeTruthy();
        const alert = screen.getByTestId("alert");
        await user.click(
          within(alert).getByRole("button", { name: "Dismiss" })
        );
        expect(screen.queryByText(message)).not.toBeTruthy();
      });
    });

    describe("when API responds with success", () => {
      it("navigates user to recipe", async () => {
        const user = userEvent.setup();
        window.confirm = jest.fn(() => true);
        const recipeId = 7;
        useParams.mockReturnValue({ recipeId });
        await renderAndWaitUntilReady(buildComponent());
        await user.click(screen.getByRole("button", { name: "Delete" }));
        expect(navigate).toHaveBeenCalledWith(`/recipe/${recipeId}`);
      });
    });
  });
});

describe("when getMatches is called", () => {
  it("it sends search to API", async () => {
    const matches = ["TestMatch1", "TestMatch2"];
    get.mockResolvedValue({ data: { matches } });
    await act(async () => render(buildComponent()));

    await Promise.all(
      AsyncAutocomplete.mock.calls.map(async (call) => {
        const getMatches = call[0].getMatches;
        const searchTerm = "TestMatch";
        getMatches(searchTerm, jest.fn());
        expect(get.mock.lastCall[0]).toMatchObject({
          routeData: { searchTerm },
        });
      })
    );
  });

  describe("when API responds with error", () => {
    it("calls setMatches with empty array", async () => {
      get.mockResolvedValue({ isError: true });
      await act(async () => render(buildComponent()));

      await Promise.all(
        AsyncAutocomplete.mock.calls.map(async (call) => {
          const getMatches = call[0].getMatches;
          const setMatches = jest.fn();
          getMatches("TestMatch", setMatches);
          await waitFor(() => expect(setMatches).toHaveBeenCalledWith([]));
        })
      );
    });
  });

  describe("when API responds with success", () => {
    it("call setMatches with value of matches", async () => {
      const matches = ["TestMatch1", "TestMatch2"];
      get.mockResolvedValue({ data: { matches } });
      await act(async () => render(buildComponent()));

      await Promise.all(
        AsyncAutocomplete.mock.calls.map(async (call) => {
          const getMatches = call[0].getMatches;
          const setMatches = jest.fn();
          getMatches("TestMatch", setMatches);
          await waitFor(() => expect(setMatches).toHaveBeenCalledWith(matches));
        })
      );
    });
  });
});
