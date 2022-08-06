import Alert from "../components/Alert";
import DropdownButton from "../components/DropdownButton";
import FieldError from "../components/FieldError";
import PageLayout from "../components/PageLayout";
import RecipeLoading from "../components/RecipeLoading";
import useApi from "../hooks/useApi";
import useIsMounted from "../hooks/useIsMounted";
import { buildTitle } from "../lib/utils";
import { compact, join, pick } from "lodash";
import { faCircleArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { handleResponseErrors } from "../lib/utils";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

function RecipeTagEditForm() {
  const [alertMessage, setAlertMessage] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  const navigate = useNavigate();
  const { get, post } = useApi();
  const { isUnmounted } = useIsMounted();
  const { recipeId, tagId } = useParams();

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
      route: "recipeTag",
      routeData: { tagId },
    }).then((response) => {
      // istanbul ignore next
      if (isUnmounted()) {
        return;
      }

      // istanbul ignore next
      if (response.isError) {
        setLoadingError(response.message);
      } else {
        setValue("name", response.data.name);
      }

      setIsLoading(false);
    });
  }, [get, isUnmounted, tagId, setValue]);

  // Same as saving for this recipe only.
  const handleFormSubmit = async (data) => {
    setIsSaving(true);

    const response = await post({
      data: pick(data, ["name"]),
      route: "recipeTagUpdateForRecipe",
      routeData: { recipeId, tagId },
    });

    // istanbul ignore next
    if (isUnmounted()) {
      return;
    }

    setIsSaving(false);

    if (response.isError) {
      handleResponseErrors({ response, setAlertMessage, setError });
      return;
    }

    navigate(`/recipe/${recipeId}`, { replace: true });
  };

  const handleDismissAlert = () => {
    setAlertMessage(null);
  };

  const handleSaveForThisRecipe = () => {
    handleFormSubmit(getValues()); // Delegate to default action for form.
  };

  const handleSaveForAllRecipes = async () => {
    setIsSaving(true);

    const response = await post({
      data: pick(getValues(), ["name"]),
      route: "recipeTagUpdate",
      routeData: { tagId },
    });

    // istanbul ignore next
    if (isUnmounted()) {
      return;
    }

    setIsSaving(false);

    if (response.isError) {
      handleResponseErrors({ response, setAlertMessage, setError });
      return;
    }

    navigate(`/recipe/${recipeId}`, { replace: true });
  };

  const handleDeleteForThisRecipe = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this tag for this recipe?"
      )
    ) {
      return;
    }

    setIsDeleting(true);

    const response = await post({
      route: "recipeTagDissociate",
      routeData: { recipeId, tagId },
    });

    // istanbul ignore next
    if (isUnmounted()) {
      return;
    }

    setIsDeleting(false);

    if (response.isError) {
      setAlertMessage(response.message);
      return;
    }

    navigate(`/recipe/${recipeId}`, { replace: true });
  };

  const handleDeleteForAllRecipes = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this tag for all recipes?"
      )
    ) {
      return;
    }

    setIsDeleting(true);

    const response = await post({
      route: "recipeTagDestroy",
      routeData: { tagId },
    });

    // istanbul ignore next
    if (isUnmounted()) {
      return;
    }

    setIsDeleting(false);

    if (response.isError) {
      setAlertMessage(response.message);
      return;
    }

    navigate(`/recipe/${recipeId}`, { replace: true });
  };

  return (
    <div className="recipe-tag-edit-form">
      <Helmet>
        <title>{buildTitle("Edit Recipe Tag")}</title>
      </Helmet>

      <PageLayout contentClassName="recipe-tag-edit-form__content">
        <h1>Edit Recipe Tag</h1>

        <RecipeLoading error={loadingError} isLoading={isLoading}>
          {() => (
            <form
              className="recipe-tag-edit-form__form"
              onSubmit={handleSubmit(handleFormSubmit)}
            >
              {alertMessage && (
                <Alert
                  className="recipe-tag-edit-form__alert"
                  onDismiss={handleDismissAlert}
                  variant="error"
                >
                  {alertMessage}
                </Alert>
              )}

              <div className="recipe-tag-edit-form__field">
                <div>
                  <label htmlFor="recipe-tag-edit-form__name">Name</label>
                </div>

                <div className="recipe-tag-edit-form__input-wrapper">
                  <input
                    type="text"
                    className={join(
                      compact([
                        errors.name && "error",
                        "recipe-tag-edit-form__input",
                      ]),
                      " "
                    )}
                    id="recipe-tag-edit-form__name"
                    {...register("name", { required: "Name is required." })}
                  />
                </div>

                <FieldError
                  className="recipe-tag-edit-form__field-error"
                  error={errors?.name?.message}
                />
              </div>

              <div className="recipe-tag-edit-form__actions">
                <DropdownButton
                  buttonClassName="button-primary"
                  buttonText="Save for ..."
                  buttonType="button"
                  menuItems={[
                    {
                      handleClick: handleSaveForThisRecipe,
                      text: "... this recipe",
                    },
                    {
                      handleClick: handleSaveForAllRecipes,
                      text: "... all recipes",
                    },
                  ]}
                  spin={isSaving}
                />

                <DropdownButton
                  buttonClassName="button-danger"
                  buttonText="Delete from ..."
                  buttonType="button"
                  menuItems={[
                    {
                      handleClick: handleDeleteForThisRecipe,
                      text: "... this recipe",
                    },
                    {
                      handleClick: handleDeleteForAllRecipes,
                      text: "... all recipes",
                    },
                  ]}
                  spin={isDeleting}
                />
              </div>
            </form>
          )}
        </RecipeLoading>

        <div className="recipe-tag-edit-form__bottom-navigation">
          <Link to={`/recipe/${recipeId}`}>
            <FontAwesomeIcon icon={faCircleArrowLeft} /> Go to recipe
          </Link>
        </div>
      </PageLayout>
    </div>
  );
}

export default RecipeTagEditForm;
