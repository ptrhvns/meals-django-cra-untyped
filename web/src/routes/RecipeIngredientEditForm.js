import Alert from "../components/Alert";
import AsyncAutocomplete from "../components/AsyncAutocomplete";
import FieldError from "../components/FieldError";
import PageLayout from "../components/PageLayout";
import RecipeLoading from "../components/RecipeLoading";
import Spinner from "../components/Spinner";
import useApi from "../hooks/useApi";
import { useNavigate, useParams } from "react-router-dom";
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

function RecipeIngredientEditForm() {
  const [alertMessage, setAlertMessage] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  const navigate = useNavigate();
  const { get, post } = useApi();
  const { recipeId, ingredientId } = useParams();

  const {
    formState: { errors },
    // getValues,
    handleSubmit,
    register,
    setError,
    setValue,
  } = useForm();

  useEffect(() => {
    get({
      route: "ingredient",
      routeData: { ingredientId },
    }).then((response) => {
      // istanbul ignore next
      if (response.isError) {
        setLoadingError(response.message);
      } else {
        setValue("amount", response.data?.amount);
        setValue("unit", response.data?.unit?.name);
        setValue("brand", response.data?.brand?.name);
        setValue("description", response.data?.description?.text);
      }

      setIsLoading(false);
    });
  }, [get, ingredientId, setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    const response = await post({
      data: pick(data, ["amount", "brand", "description", "unit"]),
      route: "ingredientUpdate",
      routeData: { ingredientId, recipeId },
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

  const getMatches = (route, searchTerm, setMatches) => {
    get({
      route,
      routeData: { searchTerm },
    }).then((response) => {
      setMatches(response.isError ? [] : response?.data?.matches);
    });
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this ingredient?")) {
      return;
    }

    setIsDeleting(true);

    const response = await post({
      route: "ingredientDestroy",
      routeData: { ingredientId, recipeId },
    });

    setIsDeleting(false);

    if (response.isError) {
      setAlertMessage(response.message);
      return;
    }

    navigate(`/recipe/${recipeId}`, { replace: true });
  };

  return (
    <div>
      <Helmet>
        <title>{buildTitle("Edit Recipe Ingredient")}</title>
      </Helmet>

      <PageLayout contentClassName="recipe-ingredient-edit-form__content">
        <h1>Edit Recipe Ingredient</h1>

        <RecipeLoading error={loadingError} isLoading={isLoading}>
          {() => (
            <form
              className="recipe-ingredient-edit-form__form"
              data-testid="recipe-ingredient-edit-form__form"
              onSubmit={handleSubmit(onSubmit)}
            >
              {alertMessage && (
                <Alert
                  onDismiss={handleDismissAlert}
                  className="recipe-ingredient-edit-form__alert"
                  variant="error"
                >
                  {alertMessage}
                </Alert>
              )}

              <div className="recipe-ingredient-edit-form__field">
                <div>
                  <label htmlFor="recipe-ingredient-edit-form__input-amount">
                    Amount
                  </label>
                </div>

                <div className="recipe-ingredient-edit-form__input-wrapper">
                  <input
                    className={join(
                      compact([
                        errors.amount && "error",
                        "recipe-ingredient-edit-form__input",
                      ]),
                      " "
                    )}
                    id="recipe-ingredient-edit-form__input-amount"
                    type="text"
                    {...register("amount")}
                  />

                  <FieldError
                    className="recipe-ingredient-edit-form__field-error"
                    error={errors?.amount?.message}
                  />
                </div>
              </div>

              <div className="recipe-ingredient-edit-form__field">
                <div>
                  <label htmlFor="recipe-ingredient-edit-form__input-unit">
                    Unit
                  </label>
                </div>

                <div className="recipe-ingredient-edit-form__input-wrapper">
                  <AsyncAutocomplete
                    getMatches={(searchTerm, setMatches) =>
                      getMatches("ingredientUnitSearch", searchTerm, setMatches)
                    }
                    inputClassName={join(
                      compact([
                        errors.unit && "error",
                        "recipe-ingredient-edit-form__input",
                      ]),
                      " "
                    )}
                    inputId="recipe-ingredient-edit-form__input-unit"
                    inputName="unit"
                    matchesClassName="recipe-ingredient-edit-form__matches"
                    register={register}
                    setValue={setValue}
                  />
                </div>

                <FieldError
                  className="recipe-ingredient-edit-form__field-error"
                  error={errors?.unit?.message}
                />
              </div>

              <div className="recipe-ingredient-edit-form__field">
                <div>
                  <label htmlFor="recipe-ingredient-edit-form__input-brand">
                    Brand
                  </label>
                </div>

                <div className="recipe-ingredient-edit-form__input-wrapper">
                  <AsyncAutocomplete
                    getMatches={(searchTerm, setMatches) =>
                      getMatches(
                        "ingredientBrandSearch",
                        searchTerm,
                        setMatches
                      )
                    }
                    inputClassName={join(
                      compact([
                        errors.brand && "error",
                        "recipe-ingredient-edit-form__input",
                      ]),
                      " "
                    )}
                    inputId="recipe-ingredient-edit-form__input-brand"
                    inputName="brand"
                    matchesClassName="recipe-ingredient-edit-form__matches"
                    register={register}
                    setValue={setValue}
                  />
                </div>

                <FieldError
                  className="recipe-ingredient-edit-form__field-error"
                  error={errors?.brand?.message}
                />
              </div>

              <div className="recipe-ingredient-edit-form__field">
                <div>
                  <label htmlFor="recipe-ingredient-edit-form__input-description">
                    Description
                  </label>
                </div>

                <div className="recipe-ingredient-edit-form__input-wrapper">
                  <AsyncAutocomplete
                    getMatches={(searchTerm, setMatches) =>
                      getMatches(
                        "ingredientDescriptionSearch",
                        searchTerm,
                        setMatches
                      )
                    }
                    inputClassName={join(
                      compact([
                        errors.description && "error",
                        "recipe-ingredient-edit-form__input",
                      ]),
                      " "
                    )}
                    inputId="recipe-ingredient-edit-form__input-description"
                    inputName="description"
                    matchesClassName="recipe-ingredient-edit-form__matches"
                    register={register}
                    registerOptions={{
                      required: "Description is required.",
                    }}
                    setValue={setValue}
                  />
                </div>

                <FieldError
                  className="recipe-ingredient-edit-form__field-error"
                  error={errors?.description?.message}
                />
              </div>

              <div className="recipe-ingredient-edit-form__actions">
                <button className="button-primary" type="submit">
                  <Spinner spin={isSubmitting}>
                    <FontAwesomeIcon icon={faCirclePlus} />
                  </Spinner>{" "}
                  Save
                </button>

                <button
                  className="button-danger"
                  onClick={handleDelete}
                  type="button"
                >
                  <Spinner spin={isDeleting}>
                    <FontAwesomeIcon icon={faCircleMinus} />
                  </Spinner>{" "}
                  Delete
                </button>
              </div>
            </form>
          )}
        </RecipeLoading>

        <div className="recipe-ingredient-edit-form__bottom-navigation">
          <Link to={`/recipe/${recipeId}`}>
            <FontAwesomeIcon icon={faCircleArrowLeft} /> Go to recipe
          </Link>
        </div>
      </PageLayout>
    </div>
  );
}

export default RecipeIngredientEditForm;
