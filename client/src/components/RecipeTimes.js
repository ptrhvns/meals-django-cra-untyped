import PropTypes from "prop-types";
import RecipeTimeCreateForm from "./RecipeTimeCreateForm";
import RecipeTimesList from "./RecipeTimesList";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  state: PropTypes.object.isRequired,
};

function RecipeTimes({ dispatch, state }) {
  const [showCreateForm, setShowCreateForm] = useState(false);

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
              onClick={() => setShowCreateForm(!showCreateForm)}
              icon={faCirclePlus}
            />
            <span className="sr-only">Create</span>
          </button>
        </div>
      </div>

      <RecipeTimesList state={state} />

      {showCreateForm && (
        <div className="recipe-times-create-form-wrapper">
          <RecipeTimeCreateForm
            dispatch={dispatch}
            setShowForm={setShowCreateForm}
            state={state}
          />
        </div>
      )}
    </div>
  );
}

RecipeTimes.propTypes = propTypes;

export default RecipeTimes;
