import PropTypes from "prop-types";

const propTypes = {
  data: PropTypes.shape({
    recipe_times: PropTypes.array,
  }),
};

const defaultProps = {
  data: null,
};

function RecipeTimes({ data }) {
  return (
    <div className="recipe-times">
      <h2 className="recipe-times__heading">Times</h2>

      <p className="recipe-times__empty-notice">
        No times have been created yet.
      </p>
    </div>
  );
}

RecipeTimes.defaultProps = defaultProps;
RecipeTimes.propTypes = propTypes;

export default RecipeTimes;
