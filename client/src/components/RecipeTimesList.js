import PropTypes from "prop-types";

const propTypes = {
  recipeState: PropTypes.object.isRequired,
};

function RecipeTimesList({ recipeState }) {
  return (
    <div className="recipe-times-list">
      {(recipeState?.times?.length || 0) < 1 && (
        <p className="recipe-times-list-empty-notice">
          No times have been created yet.
        </p>
      )}
    </div>
  );
}

RecipeTimesList.propTypes = propTypes;

export default RecipeTimesList;
