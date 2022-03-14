import PropTypes from "prop-types";
import RecipeTimeCreateForm from "./RecipeTimeCreateForm";
import RecipeTimesList from "./RecipeTimesList";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useForm } from "react-hook-form";
import { useReducer } from "react";

const propTypes = {
  recipeDispatch: PropTypes.func.isRequired,
  recipeState: PropTypes.object.isRequired,
};

function recipeTimesReducer(state, action) {
  switch (action.type) {
    case "dismissCreateForm":
      return {
        ...state,
        createFormAlertMessage: null,
        showCreateForm: false,
      };
    case "dismissCreateFormAlert":
      return { ...state, createFormAlertMessage: null };
    case "resetCreateForm":
      action.createFormMethods.reset();
      return { ...state, createFormAlertMessage: null };
    case "setCreateFormAlertMessage":
      return { ...state, createFormAlertMessage: action.message };
    case "toggleCreateForm":
      action.createFormMethods.reset({ keepErrors: false });
      return {
        ...state,
        createFormAlertMessage: null,
        showCreateForm: !state.showCreateForm,
      };
    default:
      return state;
  }
}

const initialRecipeTimesState = {
  createFormAlertMessage: null,
  showCreateForm: false,
};

function RecipeTimes({ recipeDispatch, recipeState }) {
  const [recipeTimesState, recipeTimesDispatch] = useReducer(
    recipeTimesReducer,
    initialRecipeTimesState
  );
  const createFormMethods = useForm();

  const handleToggleCreateForm = () => {
    recipeTimesDispatch({ type: "toggleCreateForm", createFormMethods });
  };

  return (
    <div className="recipe-times">
      <div className="recipe-times-header">
        <div>
          <h2 className="recipe-times-title">Times</h2>
        </div>

        <div className="recipe-times-header-actions">
          <button className="button-plain" title="Create">
            <FontAwesomeIcon
              className="recipe-times-header-action"
              onClick={handleToggleCreateForm}
              icon={faCirclePlus}
            />
            <span className="sr-only">Create</span>
          </button>
        </div>
      </div>

      <RecipeTimesList recipeState={recipeState} />

      {recipeTimesState.showCreateForm && (
        <div className="recipe-times-create-form-wrapper">
          <RecipeTimeCreateForm
            createFormMethods={createFormMethods}
            recipeDispatch={recipeDispatch}
            recipeState={recipeState}
            recipeTimesDispatch={recipeTimesDispatch}
            recipeTimesState={recipeTimesState}
          />
        </div>
      )}
    </div>
  );
}

RecipeTimes.propTypes = propTypes;

export default RecipeTimes;
