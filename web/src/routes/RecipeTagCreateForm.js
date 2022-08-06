import Alert from "../components/Alert";
import AsyncAutocomplete from "../components/AsyncAutocomplete";
import FieldError from "../components/FieldError";
import PageLayout from "../components/PageLayout";
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
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

function RecipeTagCreateForm() {
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
      data: pick(data, ["name"]),
      route: "recipeTagAssociate",
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

  const getTagMatches = (searchTerm, callback) => {
    get({
      route: "recipeTagSearch",
      routeData: { searchTerm },
    }).then((response) => {
      // istanbul ignore next
      if (isUnmounted()) {
        return;
      }

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
          </div>
        </form>

        <div className="recipe-tag-create-form__bottom-navigation">
          <Link to={`/recipe/${recipeId}`}>
            <FontAwesomeIcon icon={faCircleArrowLeft} /> Go to recipe
          </Link>
        </div>
      </PageLayout>
    </div>
  );
}

export default RecipeTagCreateForm;
