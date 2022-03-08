import PropTypes from "prop-types";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const propTypes = {
  recipeTimesDispatch: PropTypes.func.isRequired,
};

function RecipeTimesForm({ recipeTimesDispatch }) {
  return (
    <form className="recipe-times-form">
      <div className="recipe-times-form-fields">
        <div className="recipe-times-form-field-group">
          <div>
            <label htmlFor="time-type">Type</label>
          </div>

          <div className="recipe-times-form-input-wrapper">
            <select id="time-type" className="recipe-times-form-input">
              <option value="">Select a type...</option>
              <option value="additional">Additional</option>
              <option value="cook">Cook</option>
              <option value="preparation">Preparation</option>
            </select>
          </div>
        </div>

        <div className="recipe-times-form-field-group recipe-times-form-field-units">
          <div className="recipe-times-form-field-unit">
            <div>
              <label htmlFor="recipe-times-form-input-days">Days</label>
            </div>

            <div className="recipe-times-form-input-wrapper">
              <input
                className="recipe-times-form-input"
                id="recipe-times-form-input-days"
              />
            </div>
          </div>

          <div className="recipe-times-form-field-unit">
            <div>
              <label htmlFor="recipe-times-form-input-hours">Hours</label>
            </div>

            <div className="recipe-times-form-input-wrapper">
              <input
                className="recipe-times-form-input"
                id="recipe-times-form-input-hours"
              />
            </div>
          </div>

          <div className="recipe-times-form-field-unit">
            <div>
              <label htmlFor="recipe-times-form-input-seconds">Seconds</label>
            </div>

            <div className="recipe-times-form-input-wrapper">
              <input
                className="recipe-times-form-input"
                id="recipe-times-form-input-seconds"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="recipe-times-form-actions">
        <button
          className="button-primary recipe-times-form-action"
          type="submit"
        >
          <FontAwesomeIcon icon={faCirclePlus} /> Create time
        </button>

        <button
          className="recipe-times-form-action"
          onClick={() => recipeTimesDispatch({ type: "hideCreateForm" })}
          type="button"
        >
          Dismiss
        </button>
      </div>
    </form>
  );
}

RecipeTimesForm.propTypes = propTypes;

export default RecipeTimesForm;
