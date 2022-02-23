jest.mock("../lib/api", () => ({ post: jest.fn() }));

import ReactDOM from "react-dom";
import RecipeTitleForm from "./RecipeTitleForm";
import userEvent from "@testing-library/user-event";
import { act, render, waitFor } from "@testing-library/react";
import { head } from "lodash";
import { post } from "../lib/api";
import { within } from "@testing-library/dom";

function buildComponent({ dispatch = () => {}, state = { id: 777 } } = {}) {
  return <RecipeTitleForm dispatch={dispatch} state={state} />;
}

it("renders successfully", () => {
  const div = document.createElement("div");
  ReactDOM.render(buildComponent(), div);
});

it("renders state.title", () => {
  const title = "Test Title";
  const { queryByText } = render(buildComponent({ state: { title } }));
  expect(queryByText(title)).toBeTruthy();
});

describe("when edit button has been clicked", () => {
  it("renders the form", async () => {
    const user = userEvent.setup();
    const { getByRole, queryByTestId } = render(buildComponent());
    await user.click(getByRole("button", { name: "Edit" }));
    expect(queryByTestId("recipe-title-form")).toBeTruthy();
  });

  describe("when dismiss button has been clicked", () => {
    it("hides the form", async () => {
      const user = userEvent.setup();
      const container = render(buildComponent());
      await user.click(container.getByRole("button", { name: "Edit" }));
      await user.click(container.getByRole("button", { name: "Dismiss" }));
      expect(container.queryByTestId("recipe-title-form")).not.toBeTruthy();
    });
  });
});

async function submitForm(
  user,
  { getByRole, getByTestId },
  { title = "Delicious Cookies" } = {}
) {
  await user.click(getByRole("button", { name: "Edit" }));
  const input = getByTestId("recipe-title-form-input");
  await user.type(input, "{Control>}a{Backspace}");
  await user.type(input, title);
  await user.click(getByRole("button", { name: "Save" }));
}

describe("when the form as been submitted", () => {
  describe("when the required form field is missing", () => {
    it("renders a field error", async () => {
      const user = userEvent.setup();
      const { getByRole, getByText } = render(buildComponent());
      await user.click(getByRole("button", { name: "Edit" }));
      await user.click(getByRole("button", { name: "Save" }));
      getByText("Title is required.");
    });
  });

  it("submits form data to the API", async () => {
    post.mockResolvedValue({});
    const user = userEvent.setup();
    const recipeId = 555;
    const container = render(
      buildComponent({ state: { id: recipeId, title: "Good Food" } })
    );
    const title = "Good Soup";
    await act(() => submitForm(user, container, { title }));

    expect(post).toHaveBeenCalledWith({
      data: { title },
      route: "updateRecipeTitle",
      routeData: { recipeId },
    });
  });

  describe("when the API responds with a general error", () => {
    it("renders that general error as dismissable", async () => {
      const message = "An error occurred.";
      post.mockResolvedValue({ isError: true, message });
      const user = userEvent.setup();
      const container = render(buildComponent());
      await act(() => submitForm(user, container));
      expect(container.queryByText(message)).toBeTruthy();
      const alert = container.getByTestId("alert");
      await user.click(within(alert).getByRole("button", { name: "Dismiss" }));
      expect(container.queryByText(message)).not.toBeTruthy();
    });
  });

  describe("when the API responds with a field error", () => {
    it("renders that field error", async () => {
      const errors = { title: ["Title is invalid."] };
      post.mockResolvedValue({ errors, isError: true });
      const user = userEvent.setup();
      const container = render(buildComponent());
      await act(() => submitForm(user, container));
      expect(container.queryByText(head(errors.title))).toBeTruthy();
    });
  });

  describe("when the API responds with success", () => {
    it("renders the updated title", async () => {
      post.mockResolvedValue({});
      const user = userEvent.setup();
      const dispatch = jest.fn();
      const container = render(buildComponent({ dispatch }));
      const title = "Test Title";
      await act(() => submitForm(user, container, { title }));
      expect(dispatch).toHaveBeenCalledWith({ type: "updateTitle", title });
    });
  });
});

it("renders submit spinner appropriately throughout lifecycle", async () => {
  let resolve;
  post.mockReturnValue(
    new Promise((res) => {
      resolve = res;
    })
  );
  const user = userEvent.setup();
  const container = render(buildComponent());
  await act(() => submitForm(user, container));
  const testid = "recipe-title-form-submit-spinner";
  await waitFor(() => expect(container.queryByTestId(testid)).toBeTruthy());
  act(() => resolve({}));
  await waitFor(() => expect(container.queryByTestId(testid)).not.toBeTruthy());
});
