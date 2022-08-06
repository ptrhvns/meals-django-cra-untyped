import Alert from "../components/Alert";
import FieldError from "../components/FieldError";
import PageLayout from "../components/PageLayout";
import RecipeLoading from "../components/RecipeLoading";
import Spinner from "../components/Spinner";
import useApi from "../hooks/useApi";
import useIsMounted from "../hooks/useIsMounted";
import { buildTitle } from "../lib/utils";
import { compact, join, pick } from "lodash";
import {
  faCircleArrowLeft,
  faCircleMinus,
  faCirclePlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { handleResponseErrors } from "../lib/utils";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

function RecipeNotesEditor() {
  const [alertMessage, setAlertMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  const navigate = useNavigate();
  const { get, post } = useApi();
  const { isUnmounted } = useIsMounted();
  const { recipeId } = useParams();

  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
    setValue,
  } = useForm();

  useEffect(() => {
    get({
      route: "recipeNotes",
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
        setValue("notes", response.data.notes);
      }

      setIsLoading(false);
    });
  }, [get, isUnmounted, recipeId, setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    const response = await post({
      data: pick(data, ["notes"]),
      route: "recipeNotesUpdate",
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

    navigate(`/recipe/${recipeId}`, { replace: true });
  };

  const handleDismissAlert = () => {
    setAlertMessage(null);
  };

  const handleReset = () => {
    if (!window.confirm("Are you sure you want to reset notes?")) {
      return;
    }

    setIsResetting(true);

    post({
      route: "recipeNotesDestroy",
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

      navigate(`/recipe/${recipeId}`, { replace: true });
    });
  };

  return (
    <div className="recipe-notes-editor">
      <Helmet>
        <title>{buildTitle("Edit Recipe Notes")}</title>
      </Helmet>

      <PageLayout contentClassName="recipe-notes-editor__content">
        <h1>Edit Recipe Notes</h1>

        <RecipeLoading
          className="recipe-notes-editor__loading"
          error={loadingError}
          isLoading={isLoading}
        >
          {() => (
            <form
              className="recipe-notes-editor__form"
              onSubmit={handleSubmit(onSubmit)}
            >
              {alertMessage && (
                <Alert
                  className="recipe-notes-editor__alert"
                  onDismiss={handleDismissAlert}
                  variant="error"
                >
                  {alertMessage}
                </Alert>
              )}

              <div className="recipe-notes-editor__field">
                <div>
                  <label htmlFor="notes">Notes</label>
                </div>

                <div className="recipe-notes-editor__input-wrapper">
                  <textarea
                    className={join(
                      compact([
                        errors.notes && "error",
                        "recipe-notes-editor__input",
                      ]),
                      " "
                    )}
                    id="notes"
                    {...register("notes")}
                  />
                </div>

                <FieldError
                  className="recipe-notes-editor__field-error"
                  error={errors?.notes?.message}
                />
              </div>

              <div className="recipe-notes-editor__actions">
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

        <div className="recipe-notes-editor__bottom-navigation">
          <Link to={`/recipe/${recipeId}`}>
            <FontAwesomeIcon icon={faCircleArrowLeft} /> Go to recipe
          </Link>
        </div>
      </PageLayout>
    </div>
  );
}

export default RecipeNotesEditor;
