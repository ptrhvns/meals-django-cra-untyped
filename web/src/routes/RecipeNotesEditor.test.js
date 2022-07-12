jest.mock("../hooks/useApi", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}));

import AuthnProvider from "../providers/AuthnProvider";
import RecipeNotesEditor from "./RecipeNotesEditor";
import useApi from "../hooks/useApi";
import userEvent from "@testing-library/user-event";
import { createRoot } from "react-dom/client";
import { head } from "lodash";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter, useNavigate, useParams } from "react-router-dom";
import { act, render, screen, waitFor } from "@testing-library/react";
import { within } from "@testing-library/dom";

function buildComponent(props = {}) {
  return (
    <HelmetProvider>
      <MemoryRouter>
        <AuthnProvider>
          <RecipeNotesEditor {...props} />
        </AuthnProvider>
      </MemoryRouter>
    </HelmetProvider>
  );
}

async function renderAndWaitUntilReady(component) {
  render(component);
  await waitFor(() => screen.getByLabelText("Notes"));
}

async function submitForm(user, notes = "This is a submitted test note.") {
  await user.type(screen.getByLabelText("Notes"), notes);
  await user.click(screen.getByRole("button", { name: "Save" }));
}

const get = jest.fn();
const post = jest.fn();
let navigate;

beforeEach(() => {
  get.mockResolvedValue({ data: { notes: "This is a test note from get." } });
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
  await waitFor(() => expect(document.title).toContain("Edit Recipe Notes"));
});

describe("when user clicks on save button", () => {
  describe("when API responds with general error", () => {
    it("renders dismissable general error", async () => {
      const user = userEvent.setup();
      const message = "Test error.";
      post.mockResolvedValue({ isError: true, message });
      await renderAndWaitUntilReady(buildComponent());
      await submitForm(user);
      expect(screen.queryByText(message)).toBeTruthy();
      const alert = screen.getByTestId("alert");
      await user.click(within(alert).getByRole("button", { name: "Dismiss" }));
      expect(screen.queryByText(message)).not.toBeTruthy();
    });
  });

  describe("when API responds with field error", () => {
    it("renders field error", async () => {
      const user = userEvent.setup();
      const message = "Test error.";
      const errors = { notes: ["Notes is invalid."] };
      post.mockResolvedValue({ errors, isError: true, message: "Test error." });
      await renderAndWaitUntilReady(buildComponent());
      await submitForm(user);
      expect(screen.queryByText(head(errors.notes))).toBeTruthy();
    });
  });

  describe("when API responds with success", () => {
    it("navigates user to '/recipe/${recipeId}'", async () => {
      const user = userEvent.setup();
      const recipeId = 7;
      useParams.mockReturnValue({ recipeId });
      post.mockResolvedValue({});
      await renderAndWaitUntilReady(buildComponent());
      await submitForm(user);
      expect(navigate).toHaveBeenCalledWith(`/recipe/${recipeId}`);
    });
  });
});

describe("when user clicks on reset button", () => {
  describe("when user does not confirm they want to reset", () => {
    it("does not send reset request to API", async () => {
      const user = userEvent.setup();
      window.confirm = jest.fn(() => false);
      await renderAndWaitUntilReady(buildComponent());
      await user.click(screen.getByRole("button", { name: "Reset" }));
      expect(post).not.toHaveBeenCalled();
    });
  });

  describe("when user confirms they want to reset", () => {
    describe("when API responds with an error", () => {
      it("renders dismissable error", async () => {
        const user = userEvent.setup();
        window.confirm = jest.fn(() => true);
        const message = "Test error.";
        post.mockResolvedValue({ isError: true, message });
        await renderAndWaitUntilReady(buildComponent());
        await user.click(screen.getByRole("button", { name: "Reset" }));
        expect(screen.queryByText(message)).toBeTruthy();
        const alert = screen.getByTestId("alert");
        await user.click(
          within(alert).getByRole("button", { name: "Dismiss" })
        );
        expect(screen.queryByText(message)).not.toBeTruthy();
      });
    });
  });

  describe("when API responds with success", () => {
    it("navigates user to recipe", async () => {
      const user = userEvent.setup();
      window.confirm = jest.fn(() => true);
      const recipeId = 7;
      useParams.mockReturnValue({ recipeId });
      post.mockResolvedValue({});
      await renderAndWaitUntilReady(buildComponent());
      await user.click(screen.getByRole("button", { name: "Reset" }));
      expect(navigate).toHaveBeenCalledWith(`/recipe/${recipeId}`);
    });
  });
});
