jest.mock("../lib/api", () => ({ post: jest.fn() }));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

import ReactDOM from "react-dom";
import RecipeForm from "./RecipeForm";
import userEvent from "@testing-library/user-event";
import { act, render, waitFor } from "@testing-library/react";
import { head } from "lodash";
import { MemoryRouter } from "react-router-dom";
import { post } from "../lib/api";
import { useNavigate } from "react-router-dom";

function buildComponent() {
  return (
    <MemoryRouter>
      <RecipeForm />
    </MemoryRouter>
  );
}

async function submitForm(
  user,
  { getByLabelText, getByRole },
  { title = "Delicious Cookies" } = {}
) {
  await user.type(getByLabelText("Title"), title);
  await user.click(getByRole("button", { name: "Save and continue" }));
}

it("renders successfully", () => {
  const div = document.createElement("div");
  ReactDOM.render(buildComponent(), div);
});

let navigate;

beforeEach(() => {
  navigate = jest.fn();
  useNavigate.mockReturnValue(navigate);
});

describe("when the form has been submitted", () => {
  describe("when the required form fields are missing", () => {
    it("renders field errors", async () => {
      const user = userEvent.setup();
      const { getByRole, getByText } = render(buildComponent());
      await user.click(getByRole("button", { name: "Save and continue" }));
      getByText("Title is required.");
    });
  });

  it("submits form data to the API", async () => {
    post.mockResolvedValue({ data: { id: 777 } });
    const user = userEvent.setup();
    const container = render(buildComponent());
    const title = "Good Soup";
    await act(() => submitForm(user, container, { title }));

    expect(post).toHaveBeenCalledWith({
      data: { title },
      route: "createRecipe",
    });
  });

  describe("when the API returns a general error message", () => {
    it("renders a dismissable error", async () => {
      const message = "An error occurred.";
      post.mockResolvedValue({ isError: true, message });
      const user = userEvent.setup();
      const container = render(buildComponent());
      await act(() => submitForm(user, container));
      expect(container.queryByText(message)).toBeTruthy();
      await user.click(container.getByRole("button", { name: "Dismiss" }));
      expect(container.queryByText(message)).not.toBeTruthy();
    });
  });

  describe("when the API returns field errors", () => {
    it("renders field errors", async () => {
      const errors = { title: ["Title is invalid."] };
      post.mockResolvedValue({ errors, isError: true });
      const user = userEvent.setup();
      const container = render(buildComponent());
      await act(() => submitForm(user, container));
      expect(container.queryByText(head(errors.title))).toBeTruthy();
    });
  });

  describe("when given location has `from` state", () => {
    it("navigates browser to '/recipe/:recipeId'", async () => {
      const recipeId = 777;
      post.mockResolvedValue({ data: { id: recipeId } });
      const user = userEvent.setup();
      const container = render(buildComponent());
      await act(() => submitForm(user, container));

      expect(navigate).toHaveBeenCalledWith(`/recipe/${recipeId}`, {
        replace: true,
      });
    });
  });
});
