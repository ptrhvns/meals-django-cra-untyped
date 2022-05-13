jest.mock("../lib/api", () => ({ get: jest.fn(), post: jest.fn() }));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}));

import AuthnProvider from "../providers/AuthnProvider";
import ReactDOM from "react-dom";
import RecipeRatingEditor from "./RecipeRatingEditor";
import userEvent from "@testing-library/user-event";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { get, post } from "../lib/api";
import { render, screen, waitFor } from "@testing-library/react";
import { useNavigate, useParams } from "react-router-dom";
import { within } from "@testing-library/dom";
import { iteratee } from "lodash";

function buildComponent(props = {}) {
  return (
    <MemoryRouter>
      <HelmetProvider>
        <AuthnProvider>
          <RecipeRatingEditor {...props} />
        </AuthnProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

let navigate;

beforeEach(() => {
  get.mockResolvedValue({ data: { rating: 3 } });
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
  await waitFor(() => expect(document.title).toContain("Edit Recipe Rating"));
});

describe("when user selects a star", () => {
  [
    (user, element) => user.click(element),
    (user, element) => {
      element.focus();
      return user.keyboard("[Enter]");
    },
  ].forEach((activate) => {
    it("sends rating change request to API", async () => {
      const user = userEvent.setup();
      const recipeId = 7;
      useParams.mockReturnValue({ recipeId });
      render(buildComponent());
      await waitFor(() => screen.getByText("(3)"));
      const btn = screen.getByRole("button", { name: 5 });
      await activate(user, btn);
      expect(post).toHaveBeenCalledWith({
        data: { rating: 5 },
        route: "recipeRatingUpdate",
        routeData: { recipeId },
      });
    });

    describe("when API responds with error", () => {
      it("renders API error as dismissable", async () => {
        const message = "Test error.";
        post.mockResolvedValue({ isError: true, message });
        const user = userEvent.setup();
        render(buildComponent());
        await waitFor(() => screen.getByText("(3)"));
        const btn = screen.getByRole("button", { name: 5 });
        await activate(user, btn);
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
        const recipeId = 7;
        useParams.mockReturnValue({ recipeId });
        post.mockResolvedValue({});
        render(buildComponent());
        await waitFor(() => screen.getByText("(3)"));
        const btn = screen.getByRole("button", { name: 5 });
        await activate(user, btn);
        expect(navigate).toHaveBeenCalledWith(`/recipe/${recipeId}`);
      });
    });
  });
});

describe("when user clicks 'Dismiss' button", () => {
  it("navgates user to recipe", async () => {
    const user = userEvent.setup();
    const recipeId = 7;
    useParams.mockReturnValue({ recipeId });
    render(buildComponent());
    await waitFor(() => screen.getByText("(3)"));
    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(navigate).toHaveBeenCalledWith(`/recipe/${recipeId}`);
  });
});

describe("when user clicks 'Reset' button", () => {
  describe("when rating is updating", () => {
    it("does not send rating reset request to API", async () => {
      const user = userEvent.setup();
      post.mockReturnValue(new Promise(() => {}));
      const recipeId = 7;
      useParams.mockReturnValue({ recipeId });
      render(buildComponent());
      await waitFor(() => screen.getByText("(3)"));
      await user.click(screen.getByRole("button", { name: 5 }));
      await user.click(screen.getByRole("button", { name: "Reset" }));
      expect(post).not.toHaveBeenCalledWith({
        route: "recipeRatingDestroy",
        routeData: { recipeId },
      });
    });
  });

  describe("when user does not confirm they want reset", () => {
    it("does not send rating reset request to API", async () => {
      const user = userEvent.setup();
      window.confirm = jest.fn(() => false);
      render(buildComponent());
      await waitFor(() => screen.getByText("(3)"));
      await user.click(screen.getByRole("button", { name: "Reset" }));
      expect(post).not.toHaveBeenCalled();
    });
  });

  describe("when user confirms they want reset", () => {
    it("sends rating reset request to API", async () => {
      const user = userEvent.setup();
      const recipeId = 7;
      useParams.mockReturnValue({ recipeId });
      window.confirm = jest.fn(() => true);
      render(buildComponent());
      await waitFor(() => screen.getByText("(3)"));
      await user.click(screen.getByRole("button", { name: "Reset" }));
      expect(post).toHaveBeenCalledWith({
        route: "recipeRatingDestroy",
        routeData: { recipeId },
      });
    });

    describe("when API responds with error", () => {
      it("renders API error as dismissable", async () => {
        const message = "Test error.";
        post.mockResolvedValue({ isError: true, message });
        const user = userEvent.setup();
        window.confirm = jest.fn(() => true);
        render(buildComponent());
        await waitFor(() => screen.getByText("(3)"));
        await user.click(screen.getByRole("button", { name: "Reset" }));
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
        const recipeId = 7;
        useParams.mockReturnValue({ recipeId });
        post.mockResolvedValue({});
        const user = userEvent.setup();
        window.confirm = jest.fn(() => true);
        render(buildComponent());
        await waitFor(() => screen.getByText("(3)"));
        await user.click(screen.getByRole("button", { name: "Reset" }));
        expect(navigate).toHaveBeenCalledWith(`/recipe/${recipeId}`);
      });
    });
  });
});
