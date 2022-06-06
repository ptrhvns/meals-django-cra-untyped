import Alert from "../components/Alert";
import AsyncAutocomplete from "../components/AsyncAutocomplete";
import FieldError from "../components/FieldError";
import PageLayout from "../components/PageLayout";
import Spinner from "../components/Spinner";
import { buildTitle } from "../lib/utils";
import { compact, join, pick } from "lodash";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { get, post } from "../lib/api";
import { handleResponseErrors } from "../lib/utils";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

function RecipeTagCreateForm() {
  const [alertMessage, setAlertMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
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
      data: pick(data, ["name"]),
      route: "recipeTagAssociate",
      routeData: { recipeId },
    });

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

  const handleDismissForm = () => {
    navigate(`/recipe/${recipeId}`);
  };

  const getTagMatches = (searchTerm, callback) => {
    get({
      route: "recipeTagSearch",
      routeData: { searchTerm },
    }).then((response) => {
      callback(response.isError ? [] : response?.data?.matches);
    });
  };

  return (
    <div className="recipe-tag-create-form">
      <Helmet>
        <title>{buildTitle("New Recipe Tag")}</title>
      </Helmet>

      <PageLayout contentClassName="recipe-tag-create-form__content">
        <h1>New Recipe Tag</h1>

        <form
          className="recipe-tag-create-form__form"
          onSubmit={handleSubmit(onSubmit)}
        >
          {alertMessage && (
            <Alert
              className="recipe-tag-create-form__alert"
              onDismiss={handleDismissAlert}
              variant="error"
            >
              {alertMessage}
            </Alert>
          )}

          <div className="recipe-tag-create-form__field">
            <div>
              <label htmlFor="recipe-tag-create-form-input-name">Name</label>
            </div>

            <div className="recipe-tag-create-form__input-wrapper">
              <AsyncAutocomplete
                getMatches={getTagMatches}
                inputClassName={join(
                  compact([
                    errors.name && "error",
                    "recipe-tag-create-form__input",
                  ]),
                  " "
                )}
                inputId="recipe-tag-create-form-input-name"
                inputName="name"
                matchesClassName="recipe-tag-create-form__matches"
                register={register}
                registerOptions={{
                  required: "Name is required.",
                }}
                setValue={setValue}
              />
            </div>

            <FieldError
              className="recipe-tag-create-form__field-error"
              error={errors?.name?.message}
            />
          </div>

          <div className="recipe-tag-create-form__actions">
            <button className="button-primary" type="submit">
              <Spinner spin={isSubmitting}>
                <FontAwesomeIcon icon={faCirclePlus} />
              </Spinner>{" "}
              Save
            </button>

            <button onClick={handleDismissForm} type="button">
              Dismiss
            </button>
          </div>
        </form>
      </PageLayout>
    </div>
  );
}

export default RecipeTagCreateForm;