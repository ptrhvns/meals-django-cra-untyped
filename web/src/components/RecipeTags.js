import PropTypes from "prop-types";
import { isEmpty, sortBy } from "lodash";
import { Link } from "react-router-dom";

const propTypes = {
  data: PropTypes.shape({
    recipe_times: PropTypes.array,
  }),
};

const defaultProps = {
  data: null,
};

function RecipeTags({ data }) {
  return (
    <div className="recipe-tags">
      <div className="recipe-tags__heading-wrapper">
        <h2 className="recipe-tags__heading">Tags</h2>

        <Link
          className="recipe-tags__heading-action"
          to={`/recipe/${data.id}/tag/create`}
        >
          Create
        </Link>
      </div>

      {isEmpty(data.recipe_tags) ? (
        <p className="recipe-tags__empty-notice">
          No tags have been created yet.
        </p>
      ) : (
        <div className="recipe-tags__list-wrapper">
          <ul className="recipe-tags__list">
            {sortBy(data.recipe_tags, "name").map((recipeTag) => (
              <li className="recipe-tags__list-item" key={recipeTag.id}>
                <Link to={`/recipe/${data.id}/tag/${recipeTag.id}/edit`}>
                  {recipeTag.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

RecipeTags.defaultProps = defaultProps;
RecipeTags.propTypes = propTypes;

export default RecipeTags;
