import Alert from "../components/Alert";
import Container from "../components/Container";
import Navbar from "../components/Navbar";
import RecipeTitleForm from "../components/RecipeTitleForm";
import { buildTitle } from "../lib/utils";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { get } from "../lib/api";
import { Helmet } from "react-helmet-async";
import { truncate } from "lodash";
import { useEffect, useReducer, useState } from "react";
import { useParams } from "react-router-dom";

export function reducer(state, action) {
  switch (action.type) {
    case "set":
      return action.data;
    case "updateTitle":
      return { ...state, title: action.title };
    default:
      return state;
  }
}

function Recipe() {
  const [isRouteLoading, setIsRouteLoading] = useState(true);
  const [routeLoadingError, setRouteLoadingError] = useState(null);
  const [state, dispatch] = useReducer(reducer, { foo: "bar" });
  const { recipeId } = useParams();

  useEffect(
    () =>
      (async () => {
        const response = await get({
          route: "recipe",
          routeData: { recipeId },
        });
        setIsRouteLoading(false);

        if (response.isError) {
          setRouteLoadingError(response.message);
          return;
        }

        dispatch({ type: "set", data: response.data });
      })(),
    [recipeId]
  );

  return (
    <div className="recipe">
      <Helmet>
        <title>
          {buildTitle(state?.title ? truncate(state.title) : "Recipe")}
        </title>
      </Helmet>

      <Navbar />

      <Container className="recipe-viewport" variant="viewport">
        <Container variant="content">
          {isRouteLoading ? (
            <div>
              <FontAwesomeIcon icon={faSpinner} spin /> Loading
            </div>
          ) : (
            <div>
              {routeLoadingError ? (
                <Alert className="recipe-loading-alert" variant="error">
                  {routeLoadingError}
                </Alert>
              ) : (
                <div className="recipe-card">
                  <RecipeTitleForm dispatch={dispatch} state={state} />
                </div>
              )}
            </div>
          )}
        </Container>
      </Container>
    </div>
  );
}

export default Recipe;
