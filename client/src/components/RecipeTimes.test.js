import ReactDOM from "react-dom";
import RecipeTimes, { recipeTimesReducer } from "./RecipeTimes";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";

function buildComponent(props = {}) {
  props = {
    recipeDispatch: jest.fn(),
    recipeState: {},
    ...props,
  };
  return <RecipeTimes {...props} />;
}

it("renders successfully", () => {
  const div = document.createElement("div");
  ReactDOM.render(buildComponent(), div);
});

describe("recipeTimesReducer()", () => {
  describe("when action.type is 'dismissCreateForm'", () => {
    it("returns correct state for dismissed form", () => {
      const oldState = {
        foo: true,
        createFormAlertMessage: "This is a test alert.",
        showCreateForm: true,
      };
      const action = {
        type: "dismissCreateForm",
        createFormMethods: {
          reset: jest.fn(),
        },
      };
      const newState = recipeTimesReducer(oldState, action);
      expect(action.createFormMethods.reset).toHaveBeenCalledWith({
        keepErrors: false,
      });
      expect(newState).toEqual({
        foo: true,
        createFormAlertMessage: null,
        showCreateForm: false,
      });
    });
  });

  describe("when action.type is 'dismissCreateFormAlert'", () => {
    it("returns correct state for dismissed alert", () => {
      const oldState = {
        foo: true,
        createFormAlertMessage: "This is a test alert.",
      };
      const newState = recipeTimesReducer(oldState, {
        type: "dismissCreateFormAlert",
      });
      expect(newState).toEqual({
        foo: true,
        createFormAlertMessage: null,
      });
    });
  });

  describe("when action.type is 'resetCreateForm'", () => {
    it("reset form; returns correct state for reset form", () => {
      const oldState = {
        foo: true,
        createFormAlertMessage: "This is a test alert.",
      };
      const action = {
        type: "resetCreateForm",
        createFormMethods: {
          reset: jest.fn(),
        },
      };
      const newState = recipeTimesReducer(oldState, action);
      expect(action.createFormMethods.reset).toHaveBeenCalledWith({
        keepErrors: false,
      });
      expect(newState).toEqual({
        foo: true,
        createFormAlertMessage: null,
      });
    });
  });

  describe("when action.type is 'setCreateFormAlertMessage'", () => {
    it("returns correct state with new alert message", () => {
      const action = {
        type: "setCreateFormAlertMessage",
        message: "This is a test alert",
      };
      const oldState = { foo: true, createFormAlertMessage: null };
      const newState = recipeTimesReducer(oldState, action);
      expect(newState).toEqual({
        foo: true,
        createFormAlertMessage: action.message,
      });
    });
  });

  describe("when action.type is 'toggleCreateForm'", () => {
    it("resets form; returns correct state for toggled form", () => {
      const oldState = {
        foo: true,
        createFormAlertMessage: "This is a test alert.",
        showCreateForm: true,
      };
      const action = {
        type: "toggleCreateForm",
        createFormMethods: {
          reset: jest.fn(),
        },
      };
      const newState = recipeTimesReducer(oldState, action);
      expect(action.createFormMethods.reset).toHaveBeenCalledWith({
        keepErrors: false,
      });
      expect(newState).toEqual({
        foo: true,
        createFormAlertMessage: null,
        showCreateForm: !oldState.showCreateForm,
      });
    });
  });

  describe("when action.type is not recognized", () => {
    it("returns old state", () => {
      const oldState = { foo: true };
      const newState = recipeTimesReducer(oldState, { type: "invalid" });
      expect(newState).toEqual(oldState);
    });
  });
});

describe("when edit button has been clicked", () => {
  it("renders recipe time creation form", async () => {
    const user = userEvent.setup();
    render(buildComponent());
    await user.click(screen.getByRole("button", { name: "Create" }));
    expect(
      screen.queryByTestId("recipe-time-create-form-wrapper")
    ).toBeTruthy();
  });
});
