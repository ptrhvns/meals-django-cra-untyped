import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const propTypes = {
  data: PropTypes.shape({
    id: PropTypes.number.isRequired,
    servings: PropTypes.number,
  }).isRequired,
};

function RecipeServings({ data }) {
  return (
    <div className="recipe-servings">
      <div className="recipe-servings__heading-wrapper">
        <h2 className="recipe-servings__heading">Servings</h2>

        <Link
          className="recipe-servings__heading-action"
          to={`/recipe/${data.id}/servings/edit`}
        >
          Edit
        </Link>
      </div>

      {!data.servings ? (
        <p className="recipe-servings__empty-notice">
          Servings hasn't been set yet.
        </p>
      ) : (
        <span className="recipe-servings__value-wrapper">
          <Link
            className="recipe-servings__value-link"
            to={`/recipe/${data.id}/servings/edit`}
          >
            <span className="recipe-servings__value-label">Total:</span>
            <span className="recipe-servings__value">
              {Math.floor(data.servings) === data.servings
                ? Math.floor(data.servings)
                : data.servings}
            </span>
          </Link>
        </span>
      )}
    </div>
  );
}

RecipeServings.propTypes = propTypes;

export default RecipeServings;
