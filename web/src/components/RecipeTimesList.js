import PropTypes from "prop-types";
import { sortBy } from "lodash";

const propTypes = {
  recipeState: PropTypes.object.isRequired,
};

function RecipeTimesList({ recipeState }) {
  if ((recipeState?.recipe_times?.length || 0) < 1) {
    return (
      <div className="recipe-times-list">
        <p className="recipe-times-list-empty-notice">
          No times have been created yet.
        </p>
      </div>
    );
  }

  return (
    <div className="recipe-times-list">
      <ul className="recipe-times-list-list">
        {sortBy(recipeState.recipe_times, "time_type").map((rt) => (
          <li className="recipe-times-list-list-item" key={rt.id}>
            {rt.time_type} &mdash; {rt.days && `${rt.days}d`}{" "}
            {rt.hours && `${rt.hours}h`} {rt.minutes && `${rt.minutes}m`}
          </li>
        ))}
      </ul>
    </div>
  );
}

RecipeTimesList.propTypes = propTypes;

export default RecipeTimesList;
