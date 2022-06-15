jest.mock("../lib/api", () => ({ get: jest.fn(), post: jest.fn() }));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}));

import AuthnProvider from "../providers/AuthnProvider";
import ReactDOM from "react-dom";
import RecipeTagEditForm from "./RecipeTagEditForm";
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
          <RecipeTagEditForm {...props} />
        </AuthnProvider>
      </MemoryRouter>
    </HelmetProvider>
  );
}

async function renderAndWaitUntilReady(component) {
  render(component);
  await waitFor(() => screen.getByLabelText("Name"));
}

let navigate;

beforeEach(() => {
  get.mockResolvedValue({ data: { name: "TestTag" } });
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
  await waitFor(() => expect(document.title).toContain("Edit Recipe Tag"));
});

describe("when user submits form (saves tag for this recipe)", () => {
  async function fillOutAndSubmitForm(user, tag = "NewTag") {
    const input = screen.getByLabelText("Name");
    await user.type(input, tag);
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
      const errors = { name: ["Name is invalid."] };
      post.mockResolvedValue({
        errors,
        isError: true,
        message: "An error occurred.",
      });
      await renderAndWaitUntilReady(buildComponent());
      await fillOutAndSubmitForm(user);
      expect(screen.queryByText(head(errors.name))).toBeTruthy();
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

describe("when user clicks on save menu and then clicks away", () => {
  it("hides save menu", async () => {
    const user = userEvent.setup();
    await renderAndWaitUntilReady(buildComponent());
    await user.click(screen.getByRole("button", { name: "Save for ..." }));
    await waitFor(() => screen.getByText("... this recipe"));
    await user.click(screen.getByLabelText("Name"));
    await waitFor(() =>
      expect(screen.queryByText("... this recipe")).not.toBeTruthy()
    );
  });
});

describe("when user clicks on delete menu and then clicks away", () => {
  it("hides delete menu", async () => {
    const user = userEvent.setup();
    await renderAndWaitUntilReady(buildComponent());
    await user.click(screen.getByRole("button", { name: "Delete from ..." }));
    await waitFor(() => screen.getByText("... this recipe"));
    await user.click(screen.getByLabelText("Name"));
    await waitFor(() =>
      expect(screen.queryByText("... this recipe")).not.toBeTruthy()
    );
  });
});

describe("when user saves tag for this recipe", () => {
  async function fillOutAndSubmitForm(user, tag = "NewTag") {
    const input = screen.getByLabelText("Name");
    await user.type(input, tag);
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
      const errors = { name: ["Name is invalid."] };
      post.mockResolvedValue({
        errors,
        isError: true,
        message: "An error occurred.",
      });
      await renderAndWaitUntilReady(buildComponent());
      await fillOutAndSubmitForm(user);
      expect(screen.queryByText(head(errors.name))).toBeTruthy();
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

describe("when user saves tag for all recipes", () => {
  async function fillOutAndSubmitForm(user, tag = "NewTag") {
    const input = screen.getByLabelText("Name");
    await user.type(input, tag);
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
      const errors = { name: ["Name is invalid."] };
      post.mockResolvedValue({
        errors,
        isError: true,
        message: "An error occurred.",
      });
      await renderAndWaitUntilReady(buildComponent());
      await fillOutAndSubmitForm(user);
      expect(screen.queryByText(head(errors.name))).toBeTruthy();
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

describe("when user deletes tag for this recipe", () => {
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

describe("when user deletes tag for all recipes", () => {
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

describe("when user dismisses form", () => {
  it("navgates user to recipe", async () => {
    const user = userEvent.setup();
    const recipeId = 7;
    useParams.mockReturnValue({ recipeId });
    render(buildComponent());
    await waitFor(() => screen.getByLabelText("Name"));
    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(navigate).toHaveBeenCalledWith(`/recipe/${recipeId}`);
  });
});
