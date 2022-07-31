import PropTypes from "prop-types";

const propTypes = {
  children: PropTypes.node.isRequired,
};

function RecipeSection({ children }) {
  return <div className="recipe-section">{children}</div>;
}

RecipeSection.propTypes = propTypes;

export default RecipeSection;
