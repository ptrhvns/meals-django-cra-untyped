import PropTypes from "prop-types";
import { isEmpty } from "lodash";
import { Link } from "react-router-dom";

const propTypes = {
  data: PropTypes.shape({
    id: PropTypes.number.isRequired,
    notes: PropTypes.string,
  }).isRequired,
};

function RecipeNotes({ data }) {
  return (
    <div className="recipe-notes">
      <div className="recipe-notes__heading-wrapper">
        <h2 className="recipe-notes__heading">Notes</h2>

        <Link
          className="recipe-notes__heading-action"
          to={`/recipe/${data.id}/notes/edit`}
        >
          Edit
        </Link>
      </div>

      {isEmpty(data.notes) ? (
        <p className="recipe-notes__empty-notice">Notes hasn't been set yet.</p>
      ) : (
        <p>{data.notes}</p>
      )}
    </div>
  );
}

RecipeNotes.propTypes = propTypes;

export default RecipeNotes;
