import Alert from "../components/Alert";
import PageLayout from "../components/PageLayout";
import RecipeLoading from "../components/RecipeLoading";
import Spinner from "../components/Spinner";
import { buildTitle } from "../lib/utils";
import { faCircleMinus, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { get, post } from "../lib/api";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function RecipeRatingEditor() {
  const [alertMessage, setAlertMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  const [rating, setRating] = useState(0);
  const [ratingIsChangingTo, setRatingIsChangingTo] = useState(null);
  const navigate = useNavigate();
  const { recipeId } = useParams();

  const [effectiveRating, setEffectiveRating] = useState(rating);

  useEffect(() => {
    get({
      route: "recipeRating",
      routeData: { recipeId },
    }).then((response) => {
      // istanbul ignore next
      if (response.isError) {
        setLoadingError(response.message);
      } else {
        setRating(response.data.rating);
        setEffectiveRating(response.data.rating);
      }

      setIsLoading(false);
    });
  }, [recipeId]);

  const handleDismissEditor = () => {
    navigate(`/recipe/${recipeId}`);
  };

  const handleReset = () => {
    if (isUpdating) return;

    if (!window.confirm("Are you sure you want to reset the rating?")) {
      return;
    }

    setIsResetting(true);

    post({
      route: "recipeRatingDestroy",
      routeData: { recipeId },
    }).then((response) => {
      if (response.isError) {
        setAlertMessage(response.message);
        setIsResetting(false);
        return;
      }

      navigate(`/recipe/${recipeId}`);
    });
  };

  const handleDismissAlert = () => {
    setAlertMessage(null);
  };

  const handleRatingChange = (newRating) => {
    if (isUpdating) return;

    setRatingIsChangingTo(newRating);
    setIsUpdating(true);

    post({
      data: { rating: newRating },
      route: "recipeRatingUpdate",
      routeData: { recipeId },
    }).then((response) => {
      if (response.isError) {
        setAlertMessage(response.message);
        setIsUpdating(false);
        setRatingIsChangingTo(null);
        return;
      }

      navigate(`/recipe/${recipeId}`);
    });
  };

  const stars = [];
  let className;

  for (let i = 1; i <= 5; i++) {
    className =
      i <= effectiveRating
        ? "recipe-rating-editor__star-on"
        : "recipe-rating-editor__star-off";

    stars.push(
      <button
        className="button-plain"
        key={i}
        onBlur={() => isUpdating || setEffectiveRating(rating)}
        onClick={() => handleRatingChange(i)}
        onFocus={() => setEffectiveRating(i)}
        onKeyDown={(e) => e.key === "Enter" && handleRatingChange(i)}
        onMouseEnter={() => setEffectiveRating(i)}
        type="button"
      >
        <Spinner spin={isUpdating && ratingIsChangingTo === i}>
          <FontAwesomeIcon className={className} icon={faStar} />
          <span className="sr-only">{i}</span>
        </Spinner>
      </button>
    );
  }

  return (
    <div className="recipe-rating-editor">
      <Helmet>
        <title>{buildTitle("Edit Recipe Rating")}</title>
      </Helmet>

      <PageLayout contentClassName="recipe-rating-editor__content">
        <h1>Edit Recipe Rating</h1>

        <p className="recipe-rating-editor__instructions">
          Click on a star to set the rating.
        </p>

        {alertMessage && (
          <Alert
            className="recipe-rating-editor__alert"
            onDismiss={handleDismissAlert}
            variant="error"
          >
            {alertMessage}
          </Alert>
        )}

        <RecipeLoading
          className="recipe-rating-editor__alert"
          error={loadingError}
          isLoading={isLoading}
        >
          {() => (
            <div
              className="recipe-rating-editor__stars"
              onMouseLeave={() => isUpdating || setEffectiveRating(rating)}
            >
              {stars}{" "}
              <span className="recipe-rating-editor__stars-number">
                ({effectiveRating})
              </span>
            </div>
          )}
        </RecipeLoading>

        <div className="recipe-rating-editor__actions">
          <button
            className="recipe-rating-editor__action"
            onClick={handleDismissEditor}
            type="button"
          >
            Dismiss
          </button>

          <button className="button-danger" onClick={handleReset} type="button">
            <Spinner spin={isResetting}>
              <FontAwesomeIcon icon={faCircleMinus} />
            </Spinner>{" "}
            Reset
          </button>
        </div>
      </PageLayout>
    </div>
  );
}

export default RecipeRatingEditor;
