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
import RecipeEquipmentEditForm from "./RecipeEquipmentEditForm";
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
          <RecipeEquipmentEditForm />
        </AuthnProvider>
      </MemoryRouter>
    </HelmetProvider>
  );
}

async function renderAndWaitUntilReady(component) {
  render(component);
  await waitFor(() => screen.getByLabelText("Description"));
}

const get = jest.fn();
const post = jest.fn();
let navigate;

beforeEach(() => {
  get.mockResolvedValue({ data: { description: "TestEquipment" } });
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
    expect(document.title).toContain("Edit Recipe Equipment")
  );
});

describe("when user submits form (saves equipment for this recipe)", () => {
  async function fillOutAndSubmitForm(user, equipment = "NewEquipment") {
    const input = screen.getByLabelText("Description");
    await user.type(input, equipment);
    input.focus();
    await user.keyboard("{Enter}");
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
      const errors = { description: ["Description is invalid."] };
      post.mockResolvedValue({
        errors,
        isError: true,
        message: "An error occurred.",
      });
      await renderAndWaitUntilReady(buildComponent());
      await fillOutAndSubmitForm(user);
      expect(screen.queryByText(head(errors.description))).toBeTruthy();
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

describe("when user saves equipment for this recipe", () => {
  async function fillOutAndSubmitForm(user, equipment = "NewEquipment") {
    const input = screen.getByLabelText("Description");
    await user.type(input, equipment);
    await user.click(screen.getByRole("button", { name: "Save for ..." }));
    await waitFor(() => screen.getByText("... this recipe"));
    await user.click(screen.getByText("... this recipe"));
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
      const errors = { description: ["Description is invalid."] };
      post.mockResolvedValue({
        errors,
        isError: true,
        message: "An error occurred.",
      });
      await renderAndWaitUntilReady(buildComponent());
      await fillOutAndSubmitForm(user);
      expect(screen.queryByText(head(errors.description))).toBeTruthy();
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

describe("when user saves equipment for all recipes", () => {
  async function fillOutAndSubmitForm(user, equipment = "NewEquipment") {
    const input = screen.getByLabelText("Description");
    await user.type(input, equipment);
    await user.click(screen.getByRole("button", { name: "Save for ..." }));
    await waitFor(() => screen.getByText("... all recipes"));
    await user.click(screen.getByText("... all recipes"));
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
      const errors = { description: ["Description is invalid."] };
      post.mockResolvedValue({
        errors,
        isError: true,
        message: "An error occurred.",
      });
      await renderAndWaitUntilReady(buildComponent());
      await fillOutAndSubmitForm(user);
      expect(screen.queryByText(head(errors.description))).toBeTruthy();
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

  describe("when user deletes equipment for this recipe", () => {
    async function deleteFromThisRecipe(user) {
      await user.click(screen.getByRole("button", { name: "Delete from ..." }));
      await waitFor(() => screen.getByText("... this recipe"));
      await user.click(screen.getByText("... this recipe"));
    }

    describe("when user does not confirm deletion", () => {
      it("does not send deletion request to API", async () => {
        const user = userEvent.setup();
        window.confirm = jest.fn(() => false);
        await renderAndWaitUntilReady(buildComponent());
        await deleteFromThisRecipe(user);
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
          await deleteFromThisRecipe(user);
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
          await deleteFromThisRecipe(user);
          expect(navigate).toHaveBeenCalledWith(`/recipe/${recipeId}`);
        });
      });
    });
  });

  describe("when user deletes equipment for all recipes", () => {
    async function deleteFromAllRecipes(user) {
      await user.click(screen.getByRole("button", { name: "Delete from ..." }));
      await waitFor(() => screen.getByText("... all recipes"));
      await user.click(screen.getByText("... all recipes"));
    }

    describe("when user does not confirm deletion", () => {
      it("does not send deletion request to API", async () => {
        const user = userEvent.setup();
        window.confirm = jest.fn(() => false);
        await renderAndWaitUntilReady(buildComponent());
        await deleteFromAllRecipes(user);
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
          await deleteFromAllRecipes(user);
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
          await deleteFromAllRecipes(user);
          expect(navigate).toHaveBeenCalledWith(`/recipe/${recipeId}`);
        });
      });
    });
  });
});
