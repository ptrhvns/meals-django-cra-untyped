jest.mock("../lib/api", () => ({ post: jest.fn() }));

import ReactDOM from "react-dom";
import RecipeTimeCreateForm from "./RecipeTimeCreateForm";
import userEvent from "@testing-library/user-event";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import { head } from "lodash";
import { post } from "../lib/api";
import { useForm } from "react-hook-form";

function buildComponent(props = {}) {
  props = {
    createFormMethods: {
      formState: { errors: jest.fn() },
      getValues: jest.fn(),
      handleSubmit: jest.fn((f) => jest.fn((e) => e.preventDefault())),
      register: jest.fn(),
      setError: jest.fn(),
    },
    recipeDispatch: jest.fn(),
    recipeState: { id: 777 },
    recipeTimesDispatch: jest.fn(),
    recipeTimesState: { createFormAlertMessage: null },
    ...props,
  };
  return <RecipeTimeCreateForm {...props} />;
}

function TestWrapper(props = {}) {
  const createFormMethods = useForm();
  return buildComponent({ createFormMethods, ...props });
}

beforeEach(() => {
  post.mockReturnValue({});
});

it("renders successfully", () => {
  const div = document.createElement("div");
  ReactDOM.render(buildComponent(), div);
});

async function submitForm(user) {
  await user.selectOptions(screen.getByRole("combobox"), ["Cook"]);
  await user.type(screen.getByRole("spinbutton", { name: "Days" }), "1");
  await user.type(screen.getByRole("spinbutton", { name: "Hours" }), "1");
  await user.type(screen.getByRole("spinbutton", { name: "Minutes" }), "1");
  await user.click(screen.getByRole("button", { name: "Create" }));
}

describe("when the form has been submitted", () => {
  describe("when required form fields are missing", () => {
    it("renders field errors", async () => {
      const user = userEvent.setup();
      render(<TestWrapper />);
      await user.click(screen.getByRole("button", { name: "Create" }));
      expect(screen.queryByText("Type is required.")).toBeTruthy();
      expect(
        screen.queryAllByText("At least one unit is required.")
      ).toHaveLength(3);
    });
  });

  it("submits form data to API", async () => {
    post.mockResolvedValue({});
    const user = userEvent.setup();
    const props = { recipeState: { id: 555 } };
    render(<TestWrapper {...props} />);
    await act(() => submitForm(user));
    expect(post).toHaveBeenCalledWith({
      data: { days: "1", hours: "1", minutes: "1", time_type: "Cook" },
      route: "createRecipeTime",
      routeData: { recipeId: props.recipeState.id },
    });
  });

  describe("when API responds with general error", () => {
    it("dispatches 'setCreateFormAlertMessage' to recipe times reducer", async () => {
      const message = "An error occurred.";
      post.mockResolvedValue({ isError: true, message });
      const user = userEvent.setup();
      const props = { recipeTimesDispatch: jest.fn() };
      render(<TestWrapper {...props} />);
      await act(() => submitForm(user));
      expect(props.recipeTimesDispatch).toHaveBeenCalledWith({
        message: "An error occurred.",
        type: "setCreateFormAlertMessage",
      });
    });
  });

  describe("when recipe times state has create form alert message", () => {
    it("renders that alert message as dismissable", async () => {
      const user = userEvent.setup();
      const createFormAlertMessage = "test alert";
      const props = {
        recipeTimesDispatch: jest.fn(),
        recipeTimesState: { createFormAlertMessage },
      };
      render(<TestWrapper {...props} />);
      expect(screen.queryByText(createFormAlertMessage)).toBeTruthy();
      const alert = screen.getByTestId("alert");
      await user.click(within(alert).getByRole("button", { name: "Dismiss" }));
      expect(props.recipeTimesDispatch).toHaveBeenCalledWith({
        type: "dismissCreateFormAlert",
      });
    });
  });

  describe("when API responds with field errors", () => {
    it("renders those errors", async () => {
      const errors = {
        days: ["Days is invalid."],
        hours: ["Hours is invalid."],
        minutes: ["Minutes is invalid."],
        time_type: ["Time type is invalid."],
      };
      post.mockResolvedValue({ errors, isError: true });
      const user = userEvent.setup();
      render(<TestWrapper />);
      await act(() => submitForm(user));
      expect(screen.queryByText(head(errors.days))).toBeTruthy();
      expect(screen.queryByText(head(errors.hours))).toBeTruthy();
      expect(screen.queryByText(head(errors.minutes))).toBeTruthy();
      expect(screen.queryByText(head(errors.time_type))).toBeTruthy();
    });
  });

  describe("when API responds with success", () => {
    it("dispatches 'resetCreateForm' to recipe times reducer", async () => {
      const props = { recipeTimesDispatch: jest.fn() };
      post.mockResolvedValue({});
      const user = userEvent.setup();
      render(<TestWrapper {...props} />);
      await act(() => submitForm(user));
      expect(props.recipeTimesDispatch.mock.calls[0][0]).toMatchObject({
        type: "resetCreateForm",
      });
    });

    it("dispatches 'addRecipeTime' to recipe reducer", async () => {
      const props = { recipeDispatch: jest.fn() };
      const response = { data: {} };
      post.mockResolvedValue(response);
      const user = userEvent.setup();
      render(<TestWrapper {...props} />);
      await act(() => submitForm(user));
      expect(props.recipeDispatch.mock.calls[0][0]).toMatchObject({
        type: "addRecipeTime",
        data: response.data,
      });
    });
  });
});

describe("when the form has been dismissed", () => {
  it("dispatches 'dismissCreateForm' to recipe times reducer", async () => {
    const props = { recipeTimesDispatch: jest.fn() };
    const user = userEvent.setup();
    render(<TestWrapper {...props} />);
    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(props.recipeTimesDispatch).toHaveBeenCalledWith({
      type: "dismissCreateForm",
    });
  });
});
