import Alert from "../components/Alert";
import FieldError from "../components/FieldError";
import PageLayout from "../components/PageLayout";
import RecipeLoading from "../components/RecipeLoading";
import Spinner from "../components/Spinner";
import useApi from "../hooks/useApi";
import useIsMounted from "../hooks/useIsMounted";
import useOutsideClick from "../hooks/useOutsideClick";
import { buildTitle } from "../lib/utils";
import { compact, join, pick } from "lodash";
import {
  faCaretDown,
  faCircleArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
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
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const navigate = useNavigate();
  const { get, post } = useApi();
  const { isUnmounted } = useIsMounted();
  const { recipeId, tagId } = useParams();

  const deleteMenuRef = useOutsideClick(() => setShowDeleteMenu(false));
  const saveMenuRef = useOutsideClick(() => setShowSaveMenu(false));

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

    navigate(`/recipe/${recipeId}`);
  };

  const handleDismissAlert = () => {
    setAlertMessage(null);
  };

  const handleSaveMenuButtonClick = () => {
    setShowSaveMenu(true);
  };

  const handleSaveForThisRecipeClick = (event) => {
    // Don't bubble to parent button which will just open menu again.
    event.stopPropagation();
    setShowSaveMenu(false);
    handleFormSubmit(getValues()); // Delegate to default action for form.
  };

  const handleSaveForAllRecipesClick = async (event) => {
    // Don't bubble to parent button which will just open menu again.
    event.stopPropagation();
    setShowSaveMenu(false);

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

    navigate(`/recipe/${recipeId}`);
  };

  const handleDeleteMenuButtonClick = () => {
    setShowDeleteMenu(true);
  };

  const handleDeleteForThisRecipe = async (event) => {
    // Don't bubble to parent button which will just open menu again.
    event.stopPropagation();
    setShowDeleteMenu(false);

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

    navigate(`/recipe/${recipeId}`);
  };

  const handleDeleteForAllRecipes = async (event) => {
    // Don't bubble to parent button which will just open menu again.
    event.stopPropagation();
    setShowDeleteMenu(false);

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

    navigate(`/recipe/${recipeId}`);
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
                <button
                  className="button-primary recipe-tag-edit-form__menu-button"
                  onClick={handleSaveMenuButtonClick}
                  type="button"
                >
                  <Spinner spin={isSaving}>
                    <FontAwesomeIcon icon={faCaretDown} />
                  </Spinner>{" "}
                  Save for ...
                  {showSaveMenu && (
                    <div
                      className="recipe-tag-edit-form__button-menu-wrapper"
                      ref={saveMenuRef}
                    >
                      <ul className="recipe-tag-edit-form__button-menu">
                        <li
                          className="recipe-tag-edit-form__button-menu-save-item"
                          onClick={handleSaveForThisRecipeClick}
                        >
                          ... this recipe
                        </li>
                        <li
                          className="recipe-tag-edit-form__button-menu-save-item"
                          onClick={handleSaveForAllRecipesClick}
                        >
                          ... all recipes
                        </li>
                      </ul>
                    </div>
                  )}
                </button>

                <div>
                  <button
                    className="button-danger recipe-tag-edit-form__menu-button"
                    onClick={handleDeleteMenuButtonClick}
                    type="button"
                  >
                    <Spinner spin={isDeleting}>
                      <FontAwesomeIcon icon={faCaretDown} />
                    </Spinner>{" "}
                    Delete from ...
                    {showDeleteMenu && (
                      <div
                        className="recipe-tag-edit-form__button-menu-wrapper"
                        ref={deleteMenuRef}
                      >
                        <ul className="recipe-tag-edit-form__button-menu">
                          <li
                            className="recipe-tag-edit-form__button-menu-delete-item"
                            onClick={handleDeleteForThisRecipe}
                          >
                            ... this recipe
                          </li>
                          <li
                            className="recipe-tag-edit-form__button-menu-delete-item"
                            onClick={handleDeleteForAllRecipes}
                          >
                            ... all recipes
                          </li>
                        </ul>
                      </div>
                    )}
                  </button>
                </div>
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
