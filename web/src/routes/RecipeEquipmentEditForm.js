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

function RecipeEquipmentEditForm() {
  const [alertMessage, setAlertMessage] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  const navigate = useNavigate();
  const { get, post } = useApi();
  const { isUnmounted } = useIsMounted();
  const { recipeId, equipmentId } = useParams();

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
      route: "recipeEquipment",
      routeData: { equipmentId },
    }).then((response) => {
      // istanbul ignore next
      if (isUnmounted()) {
        return;
      }

      // istanbul ignore next
      if (response.isError) {
        setLoadingError(response.message);
      } else {
        setValue("description", response.data.description);
      }

      setIsLoading(false);
    });
  }, [get, isUnmounted, equipmentId, setValue]);

  const onSubmit = async (data) => {
    setIsSaving(true);

    const response = await post({
      data: pick(data, ["description"]),
      route: "recipeEquipmentUpdateForRecipe",
      routeData: { recipeId, equipmentId },
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

  const handleSaveForThisRecipe = () => {
    onSubmit(getValues());
  };

  const handleSaveForAllRecipes = async () => {
    setIsSaving(true);

    const response = await post({
      data: pick(getValues(), ["description"]),
      route: "recipeEquipmentUpdate",
      routeData: { equipmentId },
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

  const handleDeleteForThisRecipe = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this equipment for this recipe?"
      )
    ) {
      return;
    }

    setIsDeleting(true);

    const response = await post({
      route: "recipeEquipmentDissociate",
      routeData: { recipeId, equipmentId },
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

  const handleDeleteForAllRecipes = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this equipment for all recipes?"
      )
    ) {
      return;
    }

    setIsDeleting(true);

    const response = await post({
      route: "recipeEquipmentDestroy",
      routeData: { equipmentId },
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
    <div>
      <Helmet>
        <title>{buildTitle("Edit Recipe Equipment")}</title>
      </Helmet>

      <PageLayout contentClassName="recipe-equipment-edit-form__content">
        <h1>Edit Recipe Equipment</h1>

        <RecipeLoading error={loadingError} isLoading={isLoading}>
          {() => (
            <form
              className="recipe-equipment-edit-form__form"
              onSubmit={handleSubmit(onSubmit)}
            >
              {alertMessage && (
                <Alert
                  className="recipe-equipment-edit-form__alert"
                  onDismiss={handleDismissAlert}
                  variant="error"
                >
                  {alertMessage}
                </Alert>
              )}

              <div className="recipe-equipment-edit-form__field">
                <div>
                  <label htmlFor="recipe-equipment-edit-form__input-description">
                    Description
                  </label>
                </div>

                <div className="recipe-equipment-edit-form__input-wrapper">
                  <input
                    id="recipe-equipment-edit-form__input-description"
                    type="text"
                    className={join(
                      compact([
                        errors.description && "error",
                        "recipe-equipment-edit-form__input",
                      ]),
                      " "
                    )}
                    {...register("description", {
                      required: "Description is required.",
                    })}
                  />
                </div>

                <FieldError
                  className="recipe-equipment-edit-form__field-error"
                  error={errors?.description?.message}
                />
              </div>

              <div className="recipe-equipment-edit-form__actions">
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

        <div className="recipe-equipment-edit-form__bottom-navigation">
          <Link to={`/recipe/${recipeId}`}>
            <FontAwesomeIcon icon={faCircleArrowLeft} /> Go to recipe
          </Link>
        </div>
      </PageLayout>
    </div>
  );
}

export default RecipeEquipmentEditForm;
