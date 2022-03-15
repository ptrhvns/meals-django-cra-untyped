jest.mock("../lib/api", () => ({ get: jest.fn() }));

import AuthnProvider from "../providers/AuthnProvider";
import ReactDOM from "react-dom";
import Recipe, { recipeReducer } from "./Recipe";
import userEvent from "@testing-library/user-event";
import { act, render, waitFor } from "@testing-library/react";
import { get } from "../lib/api";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";

function buildComponent() {
  return (
    <MemoryRouter>
      <HelmetProvider>
        <AuthnProvider>
          <Recipe />
        </AuthnProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

it("renders successfully", () => {
  const div = document.createElement("div");
  ReactDOM.render(buildComponent(), div);
});

it("renders the correct <title> throughout lifecycle", async () => {
  let resolve;
  get.mockReturnValue(new Promise((res, _) => (resolve = res)));
  render(buildComponent());
  await waitFor(() => expect(document.title).toContain("Recipe"));
  const title = "Test Title";
  act(() => resolve({ data: { title } }));
  await waitFor(() => expect(document.title).toContain(title));
});

describe("recipeReducer()", () => {
  describe("when action.type is 'set'", () => {
    it("returns action.data", () => {
      const action = { type: "setData", data: { title: "Test Title" } };
      const newState = recipeReducer({}, action);
      expect(newState).toEqual(action.data);
    });
  });

  describe("when action.type is 'updateTitle'", () => {
    it("returns old state updated with new title", () => {
      const title = "New Test Title";
      const oldState = { foo: "bar", title: "Old Test Title" };
      const newState = recipeReducer(oldState, { type: "updateTitle", title });
      expect(newState).toEqual({ ...oldState, title });
    });
  });

  describe("when action.type is not known", () => {
    it("returns previous state", () => {
      const oldState = { title: "Old Test Title" };
      const newState = recipeReducer(oldState, { type: "invalid" });
      expect(newState).toEqual(oldState);
    });
  });
});

describe("when recipe is still loading", () => {
  it("renders a loading message", () => {
    get.mockReturnValue(new Promise(() => {}));
    const { queryByText } = render(buildComponent());
    expect(queryByText("Loading")).toBeTruthy();
  });
});

describe("when loading recipe generates an error", () => {
  it("renders that error", async () => {
    const message = "test error";
    get.mockResolvedValue({ isError: true, message });
    const { queryByText } = render(buildComponent());
    await waitFor(() => expect(queryByText(message)).toBeTruthy());
  });
});
