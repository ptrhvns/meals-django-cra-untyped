import PropTypes from "prop-types";
import { isEmpty, sortBy } from "lodash";
import { Link } from "react-router-dom";

const propTypes = {
  data: PropTypes.shape({
    id: PropTypes.number.isRequired,
    recipe_equipment: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        description: PropTypes.string.isRequired,
      }).isRequired
    ),
  }).isRequired,
};

function RecipeEquipment({ data }) {
  return (
    <div className="recipe-equipment">
      <div className="recipe-equipment__heading-wrapper">
        <h2 className="recipe_equipment__heading">Equipment</h2>

        <Link
          className="recipe-equipment__heading-action"
          to={`/recipe/${data.id}/equipment/new`}
        >
          Create
        </Link>
      </div>

      {isEmpty(data.recipe_equipment) ? (
        <p className="recipe-equipment__empty-notice">
          Equipment hasn't been created yet.
        </p>
      ) : (
        <div className="recipe-equipment__list-wrapper">
          <ul className="recipe-equipment__list">
            {sortBy(data.recipe_equipment, "description").map(
              (recipeEquipment) => (
                <li key={recipeEquipment.id}>
                  <Link
                    to={`/recipe/${data.id}/equipment/${recipeEquipment.id}/edit`}
                  >
                    {recipeEquipment.description}
                  </Link>
                </li>
              )
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

RecipeEquipment.propTypes = propTypes;

export default RecipeEquipment;
