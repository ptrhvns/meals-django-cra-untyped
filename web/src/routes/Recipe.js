import Container from "../components/Container";
import Navbar from "../components/Navbar";
import RecipeLoading from "../components/RecipeLoading";
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

      <Navbar />

      <Container className="recipe__viewport" variant="viewport">
        <Container className="recipe__content" variant="content">
          <div className="recipe__content-card">
            <RecipeLoading error={loadingError} isLoading={isLoading}>
              {() => (
                <div data-testid="recipe-loaded-content">
                  <RecipeTitle data={recipeData} />
                </div>
              )}
            </RecipeLoading>
          </div>
        </Container>
      </Container>
    </div>
  );
}

export default Recipe;
