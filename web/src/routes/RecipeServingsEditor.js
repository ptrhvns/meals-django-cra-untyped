import Alert from "../components/Alert";
import FieldError from "../components/FieldError";
import PageLayout from "../components/PageLayout";
import RecipeLoading from "../components/RecipeLoading";
import Spinner from "../components/Spinner";
import useApi from "../hooks/useApi";
import useIsMounted from "../hooks/useIsMounted";
import { buildTitle } from "../lib/utils";
import {
  faCircleArrowLeft,
  faCircleMinus,
  faCirclePlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { handleResponseErrors } from "../lib/utils";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { compact, join, pick } from "lodash";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

function RecipeServingsEditor() {
  const [alertMessage, setAlertMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  const navigate = useNavigate();
  const { get, post } = useApi();
  const { isUnmounted } = useIsMounted();
  const { recipeId } = useParams();

  const {
    formState: { errors },
    getValues,
    handleSubmit,
    register,
    setError,
    setValue,
  } = useForm();

  useEffect(() => {
    get({
      route: "recipeServings",
      routeData: { recipeId },
    }).then((response) => {
      // istanbul ignore next
      if (isUnmounted()) {
        return;
      }

      // istanbul ignore next
      if (response.isError) {
        setLoadingError(response.message);
      } else {
        setValue("servings", response.data.servings);
      }

      setIsLoading(false);
    });
  }, [get, isUnmounted, recipeId, setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    const response = await post({
      data: pick(data, ["servings"]),
      route: "recipeServingsUpdate",
      routeData: { recipeId },
    });

    // istanbul ignore next
    if (isUnmounted()) {
      return;
    }

    setIsSubmitting(false);

    if (response.isError) {
      handleResponseErrors({ response, setAlertMessage, setError });
      return;
    }

    navigate(`/recipe/${recipeId}`);
  };

  const handleDismissAlert = () => {
    setAlertMessage(null);
  };

  const handlePlusButtonClick = () => {
    const value = parseFloat(getValues("servings"));

    if (Number.isNaN(value)) {
      setValue("servings", 0);
    } else if (value < 0) {
      setValue("servings", 0);
    } else {
      setValue("servings", value + 1.0);
    }
  };

  const handleMinusButtonClick = () => {
    const value = parseFloat(getValues("servings"));

    if (Number.isNaN(value)) {
      setValue("servings", 0);
    } else if (value <= 1) {
      setValue("servings", 0);
    } else {
      setValue("servings", value - 1.0);
    }
  };

  const handleReset = () => {
    if (!window.confirm("Are you sure you want to reset servings?")) {
      return;
    }

    setIsResetting(true);

    post({
      route: "recipeServingsDestroy",
      routeData: { recipeId },
    }).then((response) => {
      // istanbul ignore next
      if (isUnmounted()) {
        return;
      }

      if (response.isError) {
        setAlertMessage(response.message);
        setIsResetting(false);
        return;
      }

      navigate(`/recipe/${recipeId}`);
    });
  };

  return (
    <div>
      <Helmet>
        <title>{buildTitle("Edit Recipe Servings")}</title>
      </Helmet>

      <PageLayout contentClassName="recipe-servings-editor__content">
        <h1>Edit Recipe Servings</h1>

        <RecipeLoading
          className="recipe-servings-editor__loading"
          error={loadingError}
          isLoading={isLoading}
        >
          {() => (
            <form
              className="recipe-servings-editor__form"
              onSubmit={handleSubmit(onSubmit)}
            >
              {alertMessage && (
                <Alert
                  className="recipe-servings-editor__alert"
                  onDismiss={handleDismissAlert}
                  variant="error"
                >
                  {alertMessage}
                </Alert>
              )}

              <div className="recipe-servings-editor__field">
                <div>
                  <label htmlFor="servings">Servings</label>
                </div>

                <div className="recipe-servings-editor__input-wrapper">
                  <button
                    className="recipe-servings-editor__plus-button"
                    onClick={handlePlusButtonClick}
                    type="button"
                  >
                    <FontAwesomeIcon icon={faCirclePlus} />
                    <span className="sr-only">Add</span>
                  </button>

                  <input
                    className={join(
                      compact([
                        errors.servings && "error",
                        "recipe-servings-editor__input",
                      ]),
                      " "
                    )}
                    id="servings"
                    inputMode="decimal"
                    noValidate
                    pattern="[0-9]*(.[0-9]+)?"
                    type="text"
                    {...register("servings", {
                      required: "Servings is required.",
                    })}
                  />

                  <button
                    className="recipe-servings-editor__minus-button"
                    onClick={handleMinusButtonClick}
                    type="button"
                  >
                    <FontAwesomeIcon icon={faCircleMinus} />
                    <span className="sr-only">Subtract</span>
                  </button>
                </div>

                <FieldError
                  className="recipe-servings-editor__field-error"
                  error={errors?.servings?.message}
                />
              </div>

              <div className="recipe-servings-editor__actions">
                <button className="button-primary" type="submit">
                  <Spinner spin={isSubmitting}>
                    <FontAwesomeIcon icon={faCirclePlus} />
                  </Spinner>{" "}
                  Save
                </button>

                <button
                  className="button-danger"
                  onClick={handleReset}
                  type="button"
                >
                  <Spinner spin={isResetting}>
                    <FontAwesomeIcon icon={faCircleMinus} />
                  </Spinner>{" "}
                  Reset
                </button>
              </div>
            </form>
          )}
        </RecipeLoading>

        <div className="recipe-servings-editor__bottom-navigation">
          <Link to={`/recipe/${recipeId}`}>
            <FontAwesomeIcon icon={faCircleArrowLeft} /> Go to recipe
          </Link>
        </div>
      </PageLayout>
    </div>
  );
}

export default RecipeServingsEditor;
