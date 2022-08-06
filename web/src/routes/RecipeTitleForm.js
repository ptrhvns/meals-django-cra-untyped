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
  faCirclePlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { handleResponseErrors } from "../lib/utils";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

function RecipeTitleForm() {
  const [alertMessage, setAlertMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  const navigate = useNavigate();
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
    setValue,
  } = useForm();
  const { get, post } = useApi();
  const { isUnmounted } = useIsMounted();
  const { recipeId } = useParams();

  useEffect(() => {
    get({
      route: "recipe",
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
        setValue("title", response.data.title);
      }

      setIsLoading(false);
    });
  }, [get, isUnmounted, recipeId, setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    const response = await post({
      data: pick(data, ["title"]),
      route: "recipeTitleUpdate",
      routeData: { recipeId },
    });

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

  return (
    <div className="recipe-title-form">
      <Helmet>
        <title>{buildTitle("Edit Recipe Title")}</title>
      </Helmet>

      <PageLayout
        contentClassName="recipe-title-form__content"
        variant="content"
      >
        <RecipeLoading error={loadingError} isLoading={isLoading}>
          {() => (
            <>
              <h1>Edit Recipe Title</h1>

              <form
                className="recipe-title-form__form"
                onSubmit={handleSubmit(onSubmit)}
              >
                {alertMessage && (
                  <Alert
                    className="recipe-title-form__alert"
                    onDismiss={handleDismissAlert}
                    variant="error"
                  >
                    {alertMessage}
                  </Alert>
                )}

                <div className="recipe-title-form__field">
                  <div>
                    <label htmlFor="title">Title</label>
                  </div>

                  <div className="recipe-title-form__input-wrapper">
                    <input
                      className={join(
                        compact([
                          errors.title && "error",
                          "recipe-title-form__input",
                        ]),
                        " "
                      )}
                      id="title"
                      type="text"
                      {...register("title", {
                        required: "Title is required.",
                      })}
                    />
                  </div>

                  <FieldError
                    className="recipe-title-form__field-error"
                    error={errors?.title?.message}
                  />
                </div>

                <div className="recipe-title-form__actions">
                  <button className="button-primary" type="submit">
                    <Spinner spin={isSubmitting}>
                      <FontAwesomeIcon icon={faCirclePlus} />
                    </Spinner>{" "}
                    Save
                  </button>
                </div>
              </form>
            </>
          )}
        </RecipeLoading>

        <div className="recipe-title-form__bottom-navigation">
          <Link to={`/recipe/${recipeId}`}>
            <FontAwesomeIcon icon={faCircleArrowLeft} /> Go to recipe
          </Link>
        </div>
      </PageLayout>
    </div>
  );
}

export default RecipeTitleForm;
