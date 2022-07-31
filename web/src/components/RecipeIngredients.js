import PropTypes from "prop-types";
import RecipeSection from "./RecipeSection";
import RecipeSectionContent from "./RecipeSectionContent";
import RecipeSectionEmptyContent from "./RecipeSectionEmptyContent";
import RecipeSectionHeader from "./RecipeSectionHeader";
import { compact, join } from "lodash";
import { Link } from "react-router-dom";

const propTypes = {
  data: PropTypes.shape({
    id: PropTypes.number.isRequired,
    ingredients: PropTypes.arrayOf(
      PropTypes.shape({
        amount: PropTypes.string,
        brand: PropTypes.shape({ name: PropTypes.string }),
        description: PropTypes.shape({ text: PropTypes.string.isRequired })
          .isRequired,
        id: PropTypes.number.isRequired,
        unit: PropTypes.shape({ name: PropTypes.string }),
      })
    ),
  }).isRequired,
};

const defaultProps = {
  data: {
    ingredients: [],
  },
};

function RecipeIngredients({ data }) {
  return (
    <RecipeSection>
      <RecipeSectionHeader
        headerText="Ingredients"
        linkText="Create"
        linkTo={`/recipe/${data.id}/ingredients/new`}
      />

      <RecipeSectionEmptyContent data={data.ingredients}>
        {() => <>Ingredients haven't been created yet.</>}
      </RecipeSectionEmptyContent>

      <RecipeSectionContent data={data.ingredients}>
        {() => (
          <ul className="recipe-ingredients__list">
            {data.ingredients.map((ingredient, index) => (
              <li
                data-testid={`recipe-ingredients__list-item-${index}`}
                key={ingredient.id}
              >
                <Link
                  to={`/recipe/${data.id}/ingredient/${ingredient.id}/edit`}
                >
                  {join(
                    compact([
                      ingredient.amount,
                      ingredient?.unit?.name,
                      ingredient?.brand?.name,
                      ingredient?.description?.text,
                    ]),
                    " "
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </RecipeSectionContent>
    </RecipeSection>
  );
}

RecipeIngredients.defaultProps = defaultProps;
RecipeIngredients.propTypes = propTypes;

export default RecipeIngredients;
