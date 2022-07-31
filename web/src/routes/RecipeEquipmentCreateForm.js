import Alert from "../components/Alert";
import AsyncAutocomplete from "../components/AsyncAutocomplete";
import FieldError from "../components/FieldError";
import PageLayout from "../components/PageLayout";
import Spinner from "../components/Spinner";
import useApi from "../hooks/useApi";
import useIsMounted from "../hooks/useIsMounted";
import { buildTitle } from "../lib/utils";
import { compact, join, pick } from "lodash";
import { faCircleArrowLeft, faCirclePlus, } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { handleResponseErrors } from "../lib/utils";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

function RecipeEquipmentCreateForm() {
  const [alertMessage, setAlertMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    const response = await post({
      data: pick(data, ["description"]),
      route: "recipeEquipmentAssociate",
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

  const getMatches = (searchTerm, setMatches) => {
    get({
      route: "recipeEquipmentSearch",
      routeData: { searchTerm },
    }).then((response) => {
      // istanbul ignore next
      if (isUnmounted()) {
        return;
      }

      setMatches(response.isError ? [] : response?.data?.matches);
    });
  };

  return (
    <div>
      <Helmet>
        <title>{buildTitle("New Recipe Equipment")}</title>
      </Helmet>

      <PageLayout contentClassName="recipe-equipment-create-form__content">
        <h1>New Recipe Equipment</h1>

        <form
          className="recipe-equipment-create-form__form"
          onSubmit={handleSubmit(onSubmit)}
        >
          {alertMessage && (
            <Alert
              className="recipe-equipment-create-form__alert"
              onDismiss={handleDismissAlert}
              variant="error"
            >
              {alertMessage}
            </Alert>
          )}

          <div className="recipe-equipment-create-form__field">
            <div>
              <label htmlFor="recipe-equipment-create-form__input-description">
                Description
              </label>
            </div>

            <div className="recipe-equipment-create-form__input-wrapper">
              <AsyncAutocomplete
                getMatches={getMatches}
                inputClassName={join(
                  compact([
                    errors.description && "error",
                    "recipe-equipment-create-form__input",
                  ]),
                  " "
                )}
                inputId="recipe-equipment-create-form__input-description"
                inputName="description"
                matchesClassName="recipe-equipment-create-form__matches"
                register={register}
                registerOptions={{
                  required: "Description is required.",
                }}
                setValue={setValue}
              />
            </div>

            <FieldError
              className="recipe-equipment-create-form__field-error"
              error={errors?.description?.message}
            />
          </div>

          <div className="recipe-equipment-create-form__actions">
            <button className="button-primary" type="submit">
              <Spinner spin={isSubmitting}>
                <FontAwesomeIcon icon={faCirclePlus} />
              </Spinner>{" "}
              Save
            </button>
          </div>
        </form>

        <div className="recipe-equipment-create-form__bottom-navigation">
          <Link to={`/recipe/${recipeId}`}>
            <FontAwesomeIcon icon={faCircleArrowLeft} /> Go to recipe
          </Link>
        </div>
      </PageLayout>
    </div>
  );
}

export default RecipeEquipmentCreateForm;
