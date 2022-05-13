import PageLayout from "../components/PageLayout";
import RecipeLoading from "../components/RecipeLoading";
import RecipeRating from "../components/RecipeRating";
import RecipeTags from "../components/RecipeTags";
import RecipeTimes from "../components/RecipeTimes";
import RecipeTitle from "../components/RecipeTitle";
import { buildTitle } from "../lib/utils";
import { get } from "../lib/api";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function Recipe() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const [recipeData, setRecipeData] = useState(null);
  const { recipeId } = useParams();

  // TODO remove istanbul directive when this is more testable.
  /* istanbul ignore next */
  useEffect(() => {
    get({
      route: "recipe",
      routeData: { recipeId },
    }).then((response) => {
      if (response.isError) {
        setLoadingError(response.message);
      } else {
        setRecipeData(response.data);
      }

      setIsLoading(false);
    });
  }, [recipeId]);

  return (
    <div className="recipe">
      <Helmet>
        <title>{buildTitle(recipeData?.title || "Recipe")}</title>
      </Helmet>

      <PageLayout>
        <RecipeLoading error={loadingError} isLoading={isLoading}>
          {() => (
            <div data-testid="recipe-loaded-content">
              <RecipeTitle data={recipeData} />
              <RecipeTags data={recipeData} />
              <RecipeRating data={recipeData} />
              <RecipeTimes data={recipeData} />
            </div>
          )}
        </RecipeLoading>
      </PageLayout>
    </div>
  );
}

export default Recipe;
