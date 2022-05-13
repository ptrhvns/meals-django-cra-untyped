import PropTypes from "prop-types";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { isInteger } from "lodash";
import { Link } from "react-router-dom";

const propTypes = {
  data: PropTypes.shape({
    id: PropTypes.number.isRequired,
    rating: PropTypes.number,
  }).isRequired,
};

function RecipeRating({ data }) {
  const stars = [];
  let className;

  for (let i = 1; i <= 5; i++) {
    className =
      i <= data.rating ? "recipe-rating__star-on" : "recipe-rating__star-off";

    stars.push(<FontAwesomeIcon className={className} icon={faStar} key={i} />);
  }

  return (
    <div className="recipe-rating">
      <div className="recipe-rating__heading-wrapper">
        <h2 className="recipe-rating__heading">Rating</h2>

        <Link
          className="recipe-rating__heading-action"
          to={`/recipe/${data.id}/rating/edit`}
        >
          Edit
        </Link>
      </div>

      {!data.rating ? (
        <p className="recipe-rating__empty-notice">
          No rating has been set yet.
        </p>
      ) : (
        <div className="recipe-rating__content">
          {stars}{" "}
          <span className="recipe-rating__stars-number">({data.rating})</span>
        </div>
      )}
    </div>
  );
}

RecipeRating.propTypes = propTypes;

export default RecipeRating;
