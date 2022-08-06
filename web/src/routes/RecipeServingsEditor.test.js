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
import RecipeServingsEditor from "./RecipeServingsEditor";
import useApi from "../hooks/useApi";
import userEvent from "@testing-library/user-event";
import { createRoot } from "react-dom/client";
import { head, isEmpty } from "lodash";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter, useNavigate, useParams } from "react-router-dom";
import { act, render, screen, waitFor } from "@testing-library/react";
import { within } from "@testing-library/dom";

function buildComponent(props = {}) {
  return (
    <HelmetProvider>
      <MemoryRouter>
        <AuthnProvider>
          <RecipeServingsEditor {...props} />
        </AuthnProvider>
      </MemoryRouter>
    </HelmetProvider>
  );
}

async function renderAndWaitUntilReady(component) {
  render(component);
  await waitFor(() => screen.getByLabelText("Servings"));
}

const get = jest.fn();
const post = jest.fn();
let navigate;

beforeEach(() => {
  get.mockResolvedValue({ data: { servings: 4 } });
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
  await waitFor(() => expect(document.title).toContain("Edit Recipe Servings"));
});

describe("when user clicks on add button", () => {
  [
    ["", "0"],
    ["-1", "0"],
    ["-2.5", "0"],
    ["0", "1"],
    ["1", "2"],
    ["2.5", "3.5"],
    ["invalid", "0"],
  ].forEach(([servings, result]) => {
    describe(`when servings is set to '${servings}'`, () => {
      it(`renders input set to '${result}'`, async () => {
        const user = userEvent.setup();
        await renderAndWaitUntilReady(buildComponent());
        const input = screen.getByLabelText("Servings");
        await user.clear(input);

        if (!isEmpty(servings)) {
          await user.type(input, servings);
        }

        await user.click(screen.getByRole("button", { name: "Add" }));
        expect(input.value).toEqual(result);
      });
    });
  });
});

describe("when user clicks on subtract button", () => {
  [
    ["", "0"],
    ["-1", "0"],
    ["-2.5", "0"],
    ["0", "0"],
    ["0.5", "0"],
    ["1", "0"],
    ["2.5", "1.5"],
    ["invalid", "0"],
  ].forEach(([servings, result]) => {
    describe(`when servings is set to '${servings}'`, () => {
      it(`renders input set to ${result}`, async () => {
        const user = userEvent.setup();
        await renderAndWaitUntilReady(buildComponent());
        const input = screen.getByLabelText("Servings");
        await user.clear(input);

        // user.type() doesn't seem to like empty strings.
        if (!isEmpty(servings)) {
          await user.type(input, servings);
        }

        await user.click(screen.getByRole("button", { name: "Subtract" }));
        expect(input.value).toEqual(result);
      });
    });
  });
});

async function submitForm(user, servings = "4") {
  await user.type(screen.getByLabelText("Servings"), servings);
  await user.click(screen.getByRole("button", { name: "Save" }));
}

describe("when user clicks on save button", () => {
  describe("when servings field is missing", () => {
    it("renders field error", async () => {
      const user = userEvent.setup();
      await renderAndWaitUntilReady(buildComponent());
      await user.clear(screen.getByLabelText("Servings"));
      await user.click(screen.getByRole("button", { name: "Save" }));
      expect(screen.queryByText("Servings is required.")).toBeTruthy();
    });
  });

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
      const errors = { servings: ["Servings is invalid."] };
      post.mockResolvedValue({ errors, isError: true, message: "Test error." });
      await renderAndWaitUntilReady(buildComponent());
      await submitForm(user);
      expect(screen.queryByText(head(errors.servings))).toBeTruthy();
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
      expect(navigate).toHaveBeenCalledWith(`/recipe/${recipeId}`, {
        replace: true,
      });
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
      expect(navigate).toHaveBeenCalledWith(`/recipe/${recipeId}`, {
        replace: true,
      });
    });
  });
});
