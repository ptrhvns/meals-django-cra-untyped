import RecipeTimeCreateForm from "./RecipeTimeCreateForm";
import ReactDOM from "react-dom";
import { render } from "@testing-library/react";

function buildComponent(props = {}) {
  props = {
    createFormMethods: {
      formState: { errors: jest.fn() },
      getValues: jest.fn(),
      handleSubmit: jest.fn(),
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

it("renders successfully", () => {
  const div = document.createElement("div");
  ReactDOM.render(buildComponent(), div);
});
