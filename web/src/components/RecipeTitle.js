import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const propTypes = {
  data: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
};

function RecipeTitle({ data }) {
  return (
    <div className="recipe-title">
      <h1 className="recipe-title__title">{data.title}</h1>

      <Link
        className="recipe-title__action"
        title="Edit title"
        to={`/recipe/${data.id}/title/edit`}
      >
        Edit
      </Link>
    </div>
  );
}

RecipeTitle.propTypes = propTypes;

export default RecipeTitle;
