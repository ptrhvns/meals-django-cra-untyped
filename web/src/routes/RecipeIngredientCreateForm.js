import Alert from "../components/Alert";
import AsyncAutocomplete from "../components/AsyncAutocomplete";
import FieldError from "../components/FieldError";
import PageLayout from "../components/PageLayout";
import Spinner from "../components/Spinner";
import useApi from "../hooks/useApi";
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
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

function RecipeIngredientCreateForm() {
  const [alertMessage, setAlertMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { get, post } = useApi();
  const { recipeId } = useParams();

  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
    setValue,
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    const response = await post({
      data: pick(data, ["amount", "brand", "description", "unit"]),
      route: "ingredientAssociate",
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

  const getMatches = (route, searchTerm, setMatches) => {
    get({
      route,
      routeData: { searchTerm },
    }).then((response) => {
      setMatches(response.isError ? [] : response?.data?.matches);
    });
  };

  return (
    <div>
      <Helmet>
        <title>{buildTitle("New Recipe Ingredient")}</title>
      </Helmet>

      <PageLayout contentClassName="recipe-ingredient-create-form__content">
        <h1>New Recipe Ingredient</h1>

        <form
          className="recipe-ingredient-create-form__form"
          onSubmit={handleSubmit(onSubmit)}
        >
          {alertMessage && (
            <Alert
              className="recipe-ingredient-create-form__alert"
              onDismiss={handleDismissAlert}
              variant="error"
            >
              {alertMessage}
            </Alert>
          )}

          <div className="recipe-ingredient-create-form__field">
            <div>
              <label htmlFor="recipe-ingredient-create-form__input-amount">
                Amount
              </label>
            </div>

            <div className="recipe-ingredient-create-form__input-wrapper">
              <input
                className={join(
                  compact([
                    errors.amount && "error",
                    "recipe-ingredient-create-form__input",
                  ]),
                  " "
                )}
                id="recipe-ingredient-create-form__input-amount"
                type="text"
                {...register("amount")}
              />
            </div>

            <FieldError
              className="recipe-ingredient-create-form__field-error"
              error={errors?.amount?.message}
            />
          </div>

          <div className="recipe-ingredient-create-form__field">
            <div>
              <label htmlFor="recipe-ingredient-create-form__input-unit">
                Unit
              </label>
            </div>

            <div className="recipe-ingredient-create-form__input-wrapper">
              <AsyncAutocomplete
                getMatches={(searchTerm, setMatches) =>
                  getMatches("ingredientUnitSearch", searchTerm, setMatches)
                }
                inputClassName={join(
                  compact([
                    errors.unit && "error",
                    "recipe-ingredient-create-form__input",
                  ]),
                  " "
                )}
                inputId="recipe-ingredient-create-form__input-unit"
                inputName="unit"
                matchesClassName="recipe-ingredient-create-form__matches"
                register={register}
                setValue={setValue}
              />
            </div>

            <FieldError
              className="recipe-ingredient-create-form__field-error"
              error={errors?.unit?.message}
            />
          </div>

          <div className="recipe-ingredient-create-form__field">
            <div>
              <label htmlFor="recipe-ingredient-create-form__input-brand">
                Brand
              </label>
            </div>

            <div className="recipe-ingredient-create-form__input-wrapper">
              <AsyncAutocomplete
                getMatches={(searchTerm, setMatches) =>
                  getMatches("ingredientBrandSearch", searchTerm, setMatches)
                }
                inputClassName={join(
                  compact([
                    errors.brand && "error",
                    "recipe-ingredient-create-form__input",
                  ]),
                  " "
                )}
                inputId="recipe-ingredient-create-form__input-brand"
                inputName="brand"
                matchesClassName="recipe-ingredient-create-form__matches"
                register={register}
                setValue={setValue}
              />
            </div>

            <FieldError
              className="recipe-ingredient-create-form__field-error"
              error={errors?.brand?.message}
            />
          </div>

          <div className="recipe-ingredient-create-form__field">
            <div>
              <label htmlFor="recipe-ingredient-create-form__description">
                Description
              </label>
            </div>

            <div className="recipe-ingredient-create-form__input-wrapper">
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
                    "recipe-ingredient-create-form__input",
                  ]),
                  " "
                )}
                inputId="recipe-ingredient-create-form__input-description"
                inputName="description"
                matchesClassName="recipe-ingredient-create-form__matches"
                register={register}
                registerOptions={{
                  required: "Description is required.",
                }}
                setValue={setValue}
              />
            </div>

            <FieldError
              className="recipe-ingredient-create-form__field-error"
              error={errors?.description?.message}
            />
          </div>

          <div className="recipe-ingredient-create-form__actions">
            <button className="button-primary" type="submit">
              <Spinner spin={isSubmitting}>
                <FontAwesomeIcon icon={faCirclePlus} />
              </Spinner>{" "}
              Save
            </button>
          </div>
        </form>

        <div className="recipe-ingredient-create-form__bottom-navigation">
          <Link to={`/recipe/${recipeId}`}>
            <FontAwesomeIcon icon={faCircleArrowLeft} /> Go to recipe
          </Link>
        </div>
      </PageLayout>
    </div>
  );
}

export default RecipeIngredientCreateForm;
