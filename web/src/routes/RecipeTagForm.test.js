jest.mock("../lib/api", () => ({ post: jest.fn() }));

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
import { post } from "../lib/api";
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
  await waitFor(() => expect(document.title).toContain("Add Recipe Tag"));
});

async function submitForm(user, { name = "TestTag" } = {}) {
  const input = screen.getByLabelText("Name");
  await user.clear(input);
  await user.type(input, name);
  await user.click(screen.getByRole("button", { name: "Add" }));
}

describe("when the form has been submitted", () => {
  describe("when the name is missing", () => {
    it("renders a field error", async () => {
      const user = userEvent.setup();
      render(buildComponent());
      const input = screen.getByLabelText("Name");
      await user.clear(input);
      await user.click(screen.getByRole("button", { name: "Add" }));
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
      route: "addRecipeTag",
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
