jest.mock("../lib/api", () => ({ get: jest.fn(), post: jest.fn() }));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}));

import AuthnProvider from "../providers/AuthnProvider";
import ReactDOM from "react-dom";
import RecipeTagForm from "./RecipeTagForm";
import userEvent from "@testing-library/user-event";
import { act, render, screen, waitFor } from "@testing-library/react";
import { head } from "lodash";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter, useNavigate, useParams } from "react-router-dom";
import { get, post } from "../lib/api";
import { within } from "@testing-library/dom";

function buildComponent(props = {}) {
  return (
    <MemoryRouter>
      <HelmetProvider>
        <AuthnProvider>
          <RecipeTagForm {...props} />
        </AuthnProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

let navigate;

beforeEach(() => {
  post.mockResolvedValue({});
  navigate = jest.fn();
  useNavigate.mockReturnValue(navigate);
  useParams.mockReturnValue({ recipeId: 1 });
});

it("renders successfully", () => {
  const div = document.createElement("div");
  ReactDOM.render(buildComponent(), div);
});

it("renders the correct <title>", async () => {
  const component = render(buildComponent());
  await waitFor(() => expect(document.title).toContain("New Recipe Tag"));
});

async function submitForm(user, { name = "TestTag" } = {}) {
  const input = screen.getByLabelText("Name");
  await user.clear(input);
  await user.type(input, name);
  await user.click(screen.getByRole("button", { name: "Save" }));
}

describe("when the form has been submitted", () => {
  describe("when the name is missing", () => {
    it("renders a field error", async () => {
      const user = userEvent.setup();
      render(buildComponent());
      const input = screen.getByLabelText("Name");
      await user.clear(input);
      await user.click(screen.getByRole("button", { name: "Save" }));
      await waitFor(() =>
        expect(screen.queryByText("Name is required.")).toBeTruthy()
      );
    });
  });

  it("submits form data to the API", async () => {
    const recipeId = 1;
    useParams.mockReturnValue({ recipeId });
    const name = "TestTag";
    const user = userEvent.setup();
    render(buildComponent());
    await act(() => submitForm(user, { name }));
    expect(post).toHaveBeenCalledWith({
      data: { name },
      route: "recipeTagCreate",
      routeData: { recipeId },
    });
  });

  describe("when the API returns a general error", () => {
    it("renders that error as dismissable", async () => {
      const message = "An error occurred.";
      post.mockReturnValue(Promise.resolve({ isError: true, message }));
      const user = userEvent.setup();
      render(buildComponent());
      await act(() => submitForm(user));
      expect(screen.queryByText(message)).toBeTruthy();
      const alert = screen.getByTestId("alert");
      await user.click(within(alert).getByRole("button", { name: "Dismiss" }));
      expect(screen.queryByText(message)).not.toBeTruthy();
    });
  });

  describe("when the API returns a field error for title", () => {
    it("renders that field error", async () => {
      const errors = { name: ["Name is invalid."] };
      post.mockResolvedValue({
        errors,
        isError: true,
        message: "An error occurred.",
      });
      const user = userEvent.setup();
      render(buildComponent());
      await act(() => submitForm(user));
      expect(screen.queryByText(head(errors.name))).toBeTruthy();
    });
  });

  describe("when the API returns success", () => {
    it("navigates user to '/recipe/${recipeId}'", async () => {
      const recipeId = 1;
      useParams.mockReturnValue({ recipeId });
      post.mockResolvedValue({});
      const user = userEvent.setup();
      render(buildComponent());
      await act(() => submitForm(user));
      expect(navigate).toHaveBeenCalledWith(`/recipe/${recipeId}`);
    });
  });

  describe("when tag ID is defined", () => {
    it("uses tag update route to send to API", async () => {
      const recipeId = 7;
      const tagId = 7;
      const name = "TestTag";
      useParams.mockReturnValue({ recipeId, tagId });
      const user = userEvent.setup();
      post.mockResolvedValue({});
      get.mockResolvedValue({ data: { name } });
      await act(async () => render(buildComponent()));
      await act(() => submitForm(user));
      expect(post).toHaveBeenCalledWith({
        data: { name },
        route: "updateRecipeTag",
        routeData: { recipeId, tagId },
      });
    });
  });
});

describe("when form is dismissed", () => {
  it("navigates user to '/recipe/${recipeId}", async () => {
    const recipeId = 1;
    useParams.mockReturnValue({ recipeId });
    const user = userEvent.setup();
    render(buildComponent());
    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(navigate).toHaveBeenCalledWith(`/recipe/${recipeId}`);
  });
});

describe("when the component is loading", () => {
  describe("when the API returns recipe tag data", () => {
    it("renders the tag name in the form input for name", async () => {
      const name = "TestTag";
      useParams.mockReturnValue({ recipeId: 1, tagId: 1 });
      get.mockResolvedValue({ data: { name } });
      await act(async () => render(buildComponent()));
      expect(screen.getByLabelText("Name").value).toEqual(name);
    });
  });
});

describe("when delete button is clicked", () => {
  describe("when user does not confirm deletion of tag", () => {
    it("does not delete tag", async () => {
      const user = userEvent.setup();
      useParams.mockReturnValue({ recipeId: 7, tagId: 7 });
      get.mockResolvedValue({ data: { name: "TestTag" } });
      window.confirm = jest.fn(() => false);
      await act(async () => render(buildComponent()));
      await user.click(screen.getByRole("button", { name: "Delete" }));
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  describe("when user confirms deletion of tag", () => {
    it("sends tag deletion request to API", async () => {
      const user = userEvent.setup();
      const tagId = 7;
      useParams.mockReturnValue({ recipeId: 7, tagId });
      get.mockResolvedValue({ data: { name: "TestTag" } });
      window.confirm = jest.fn(() => true);
      await act(async () => render(buildComponent()));
      await user.click(screen.getByRole("button", { name: "Delete" }));
      expect(post).toHaveBeenCalledWith({
        route: "recipeTagDestroy",
        routeData: { tagId },
      });
    });

    describe("when API responds an error", () => {
      it("renders alert with API error", async () => {
        const user = userEvent.setup();
        useParams.mockReturnValue({ recipeId: 7, tagId: 7 });
        get.mockResolvedValue({ data: { name: "TestTag" } });
        const message = "Test error.";
        post.mockResolvedValue({ isError: true, message });
        window.confirm = jest.fn(() => true);
        await act(async () => render(buildComponent()));
        await user.click(screen.getByRole("button", { name: "Delete" }));
        expect(screen.queryByText(message)).toBeTruthy();
      });
    });

    describe("when API responds with success", () => {
      it("navigates user to '/recipe/${recipeId}'", async () => {
        const user = userEvent.setup();
        const recipeId = 7;
        useParams.mockReturnValue({ recipeId, tagId: 7 });
        get.mockResolvedValue({ data: { name: "TestTag" } });
        window.confirm = jest.fn(() => true);
        await act(async () => render(buildComponent()));
        await user.click(screen.getByRole("button", { name: "Delete" }));
        expect(navigate).toHaveBeenCalledWith(`/recipe/${recipeId}`);
      });
    });
  });
});
