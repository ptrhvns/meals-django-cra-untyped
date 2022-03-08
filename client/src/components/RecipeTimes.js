import PropTypes from "prop-types";
import RecipeTimeCreateForm from "./RecipeTimeCreateForm";
import RecipeTimesList from "./RecipeTimesList";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useReducer } from "react";

const propTypes = {
  recipeState: PropTypes.object.isRequired,
};

function recipeTimesReducer(state, action) {
  switch (action.type) {
    case "hideCreateForm":
      return { ...state, showCreateForm: false };
    case "toggleCreateForm":
      return { ...state, showCreateForm: !state.showCreateForm };
    default:
      return state;
  }
}

const initialRecipeTimesState = {
  showCreateForm: false,
};

function RecipeTimes({ recipeState }) {
  const [recipeTimesState, recipeTimesDispatch] = useReducer(
    recipeTimesReducer,
    initialRecipeTimesState
  );

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
              onClick={() => recipeTimesDispatch({ type: "toggleCreateForm" })}
              icon={faCirclePlus}
            />
            <span className="sr-only">Create</span>
          </button>
        </div>
      </div>

      <RecipeTimesList recipeState={recipeState} />

      {recipeTimesState.showCreateForm && (
        <div className="recipe-times-create-form-wrapper">
          <RecipeTimeCreateForm recipeTimesDispatch={recipeTimesDispatch} />
        </div>
      )}
    </div>
  );
}

RecipeTimes.propTypes = propTypes;

export default RecipeTimes;
