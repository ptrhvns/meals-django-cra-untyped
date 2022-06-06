jest.mock("../lib/api", () => ({ get: jest.fn(), post: jest.fn() }));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock("../components/AsyncAutocomplete");

import AsyncAutocomplete from "../components/AsyncAutocomplete";
import AuthnProvider from "../providers/AuthnProvider";
import ReactDOM from "react-dom";
import RecipeTagCreateForm from "./RecipeTagCreateForm";
import userEvent from "@testing-library/user-event";
import { get, post } from "../lib/api";
import { head } from "lodash";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter, useNavigate, useParams } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { within } from "@testing-library/dom";

function buildComponent(props = {}) {
  return (
    <HelmetProvider>
      <MemoryRouter>
        <AuthnProvider>
          <RecipeTagCreateForm {...props} />
        </AuthnProvider>
      </MemoryRouter>
    </HelmetProvider>
  );
}

async function fillOutAndSubmitForm(user, { name = "TestTag" } = {}) {
  // AsyncAutocomplete is mocked out, so no need to fill out input.
  await user.click(screen.getByRole("button", { name: "Save" }));
}

let navigate;

beforeEach(() => {
  AsyncAutocomplete.mockReturnValue(<></>);
  get.mockResolvedValue({ data: { matches: [] } });
  post.mockResolvedValue({});
  navigate = jest.fn();
  useNavigate.mockReturnValue(navigate);
  useParams.mockReturnValue({ recipeId: 1 });
});

it("renders successfully", () => {
  const div = document.createElement("div");
  ReactDOM.render(buildComponent(), div);
});

it("renders correct <title>", async () => {
  render(buildComponent());
  await waitFor(() => expect(document.title).toContain("New Recipe Tag"));
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
      const errors = { name: ["Name is invalid."] };
      post.mockResolvedValue({
        errors,
        isError: true,
        message: "An error occurred.",
      });
      render(buildComponent());
      await fillOutAndSubmitForm(user);
      expect(screen.queryByText(head(errors.name))).toBeTruthy();
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
      expect(navigate).toHaveBeenCalledWith(`/recipe/${recipeId}`);
    });
  });
});

describe("when getTagMatches is called", () => {
  it("it sends search to API", () => {
    const matches = ["TestMatch1", "TestMatch2"];
    get.mockResolvedValue({ data: { matches } });
    render(buildComponent());
    const getMatches = AsyncAutocomplete.mock.lastCall[0].getMatches;
    const searchTerm = "TestMatch";
    getMatches(searchTerm, jest.fn());
    expect(get).toHaveBeenCalledWith({
      route: "recipeTagSearch",
      routeData: { searchTerm },
    });
  });

  describe("when API responds with error", () => {
    it("calls callback with empty array", async () => {
      get.mockResolvedValue({ isError: true });
      render(buildComponent());
      const getMatches = AsyncAutocomplete.mock.lastCall[0].getMatches;
      const callback = jest.fn();
      getMatches("TestMatch", callback);
      await waitFor(() => expect(callback).toHaveBeenCalledWith([]));
    });
  });

  describe("when API responds with success", () => {
    it("call callback with value of matches", async () => {
      const matches = ["TestMatch1", "TestMatch2"];
      get.mockResolvedValue({ data: { matches } });
      render(buildComponent());
      const getMatches = AsyncAutocomplete.mock.lastCall[0].getMatches;
      const callback = jest.fn();
      getMatches("TestMatch", callback);
      await waitFor(() => expect(callback).toHaveBeenCalledWith(matches));
    });
  });
});

describe("when user clicks 'Dismiss' button", () => {
  it("navgates user to recipe", async () => {
    const user = userEvent.setup();
    const recipeId = 7;
    useParams.mockReturnValue({ recipeId });
    render(buildComponent());
    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(navigate).toHaveBeenCalledWith(`/recipe/${recipeId}`);
  });
});
