import Alert from "./Alert";
import useApi from "../hooks/useApi";
import useIsMounted from "../hooks/useIsMounted";
import { faCirclePlus, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

function RecipeList() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const { get } = useApi();
  const { isUnmounted } = useIsMounted();

  useEffect(
    () =>
      (async () => {
        const response = await get({ route: "recipes" });

        // istanbul ignore next
        if (isUnmounted()) {
          return;
        }

        setIsLoading(false);

        if (response.isError) {
          setLoadingError(response.message);
        }

        setRecipes(response.data);
      })(),
    [get, isUnmounted]
  );

  let content;

  if (isLoading) {
    content = (
      <p className="recipe-list__notice">
        <FontAwesomeIcon icon={faSpinner} spin /> Loading recipes
      </p>
    );
  } else if (loadingError) {
    content = (
      <Alert className="recipe-list__alert" variant="error">
        <p>{loadingError}</p>
      </Alert>
    );
  } else if (recipes.length < 1) {
    content = (
      <p className="recipe-list__notice">No recipes have been created yet.</p>
    );
  } else {
    content = (
      <div className="recipe-list__list-wrapper">
        <ul className="recipe-list__list" data-testid="recipe-list__list">
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <Link to={`/recipe/${recipe.id}`}>{recipe.title}</Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="recipe-list">
      <h2>Recipes</h2>

      {content}

      <div className="recipe-list__actions">
        <Link className="link-button" to="/recipe/new">
          <FontAwesomeIcon icon={faCirclePlus} /> Create a recipe
        </Link>
      </div>
    </div>
  );
}

export default RecipeList;
