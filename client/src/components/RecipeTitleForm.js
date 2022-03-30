import Alert from "./Alert";
import FieldError from "./FieldError";
import PropTypes from "prop-types";
import Spinner from "./Spinner";
import { compact, join } from "lodash";
import {
  faCheck,
  faPenToSquare,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { handleResponseErrors } from "../lib/utils";
import { pick } from "lodash";
import { post } from "../lib/api";
import { useForm } from "react-hook-form";
import { useState } from "react";

const propTypes = {
  recipeDispatch: PropTypes.func.isRequired,
  recipeState: PropTypes.object.isRequired,
};

function RecipeTitleForm({ recipeDispatch, recipeState }) {
  const [alertMessage, setAlertMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
  } = useForm();

  // Prevent form from "flashing" new title inside the input by only setting the
  // form value from props when the form isn't showing.
  if (!showForm) {
    setValue("title", recipeState.title);
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const response = await post({
      data: pick(data, ["title"]),
      route: "updateRecipeTitle",
      routeData: { recipeId: recipeState.id },
    });
    setIsSubmitting(false);

    if (response.isError) {
      handleResponseErrors({ response, setAlertMessage, setError });
      return;
    }

    setShowForm(false);
    reset({ keepErrors: false });
    recipeDispatch({ type: "updateTitle", title: data.title });
  };

  const handleDismissAlert = () => {
    setAlertMessage(null);
  };

  const handleDismissForm = () => {
    setAlertMessage(null);
    setShowForm(false);
    reset({ keepErrors: false });
  };

  return (
    <div className="recipe-title-form">
      {showForm ? (
        <form data-testid="recipe-title-form" onSubmit={handleSubmit(onSubmit)}>
          {alertMessage && (
            <Alert
              className="recipe-title-form-alert"
              onDismiss={handleDismissAlert}
              variant="error"
            >
              {alertMessage}
            </Alert>
          )}

          <div className="recipe-title-form-inline-form">
            <span className="sr-only">
              <label htmlFor="title">Title</label>
            </span>

            <input
              className={join(
                compact([
                  errors.title && "error",
                  "recipe-title-form-form-input",
                ]),
                " "
              )}
              data-testid="recipe-title-form-input"
              id="title"
              type="text"
              {...register("title", {
                required: "Title is required.",
              })}
            />

            <button
              className="button-primary recipe-title-form-form-button"
              title="Save"
              type="submit"
            >
              <Spinner spin={isSubmitting}>
                <FontAwesomeIcon icon={faCheck} />
              </Spinner>{" "}
              <span className="sr-only">Save</span>
            </button>

            <button
              className="recipe-title-form-form-button"
              onClick={handleDismissForm}
              title="Dismiss"
              type="button"
            >
              <FontAwesomeIcon icon={faXmark} />
              <span className="sr-only">Dismiss</span>
            </button>
          </div>

          <FieldError error={errors?.title?.message} />
        </form>
      ) : (
        <div className="recipe-title-form-static">
          <h1 className="recipe-title-form-title">{recipeState.title}</h1>

          <button
            className="button-plain recipe-title-form-edit-button"
            onClick={() => setShowForm(true)}
            title="Edit"
          >
            <FontAwesomeIcon icon={faPenToSquare} />
            <span className="sr-only">Edit</span>
          </button>
        </div>
      )}
    </div>
  );
}

RecipeTitleForm.propTypes = propTypes;

export default RecipeTitleForm;
