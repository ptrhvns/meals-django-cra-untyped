jest.mock("../hooks/useApi", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

import RecipeForm from "./RecipeForm";
import useApi from "../hooks/useApi";
import userEvent from "@testing-library/user-event";
import { act, render, screen } from "@testing-library/react";
import { createRoot } from "react-dom/client";
import { head } from "lodash";
import { MemoryRouter } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { within } from "@testing-library/dom";

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
  const container = document.createElement("div");
  const root = createRoot(container);
  act(() => root.render(buildComponent()));
});

const post = jest.fn();
let navigate;

beforeEach(() => {
  post.mockResolvedValue({});
  useApi.mockReturnValue({ post });
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
    await submitForm(user, container, { title });

    expect(post).toHaveBeenCalledWith({
      data: { title },
      route: "recipeCreate",
    });
  });

  describe("when the API returns a general error message", () => {
    it("renders a dismissable error", async () => {
      const message = "An error occurred.";
      post.mockResolvedValue({ isError: true, message });
      const user = userEvent.setup();
      const container = render(buildComponent());
      await submitForm(user, container);
      expect(container.queryByText(message)).toBeTruthy();
      const alert = screen.getByTestId("alert");
      await user.click(within(alert).getByRole("button", { name: "Dismiss" }));
      expect(container.queryByText(message)).not.toBeTruthy();
    });
  });

  describe("when the API returns field errors", () => {
    it("renders field errors", async () => {
      const errors = { title: ["Title is invalid."] };
      post.mockResolvedValue({ errors, isError: true });
      const user = userEvent.setup();
      const container = render(buildComponent());
      await submitForm(user, container);
      expect(container.queryByText(head(errors.title))).toBeTruthy();
    });
  });

  describe("when given location has `from` state", () => {
    it("navigates browser to '/recipe/:recipeId'", async () => {
      const recipeId = 777;
      post.mockResolvedValue({ data: { id: recipeId } });
      const user = userEvent.setup();
      const container = render(buildComponent());
      await submitForm(user, container);

      expect(navigate).toHaveBeenCalledWith(`/recipe/${recipeId}`, {
        replace: true,
      });
    });
  });
});

describe("when user clicks 'Dismiss' button", () => {
  it("navgates browser to '/'", async () => {
    const user = userEvent.setup();
    render(buildComponent());
    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(navigate).toHaveBeenCalledWith("/");
  });
});
