import PropTypes from "prop-types";

const propTypes = {
  state: PropTypes.object.isRequired,
};

function RecipeTimesList({ state }) {
  return (
    <div className="recipe-times-list">
      {(state?.times?.length || 0) < 1 && (
        <p className="recipe-times-list-empty-notice">
          No times have been created yet.
        </p>
      )}
    </div>
  );
}

RecipeTimesList.propTypes = propTypes;

export default RecipeTimesList;
