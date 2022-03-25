import Alert from "./Alert";
import Spinner from "./Spinner";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { handleResponseErrors } from "../lib/utils";
import { pick } from "lodash";
import { post } from "../lib/api";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function RecipeCreateForm() {
  const [alertMessage, setAlertMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const response = await post({
      data: pick(data, ["title"]),
      route: "createRecipe",
    });
    setIsSubmitting(false);

    if (response.isError) {
      handleResponseErrors({ response, setAlertMessage, setError });
      return;
    }

    navigate(`/recipe/${response.data.id}`, { replace: true });
  };

  return (
    <div className="recipe-create-form">
      <form onSubmit={handleSubmit(onSubmit)}>
        {alertMessage && (
          <Alert
            className="recipe-create-form-alert"
            onDismiss={() => setAlertMessage(null)}
            variant="error"
          >
            {alertMessage}
          </Alert>
        )}

        <div className="recipe-create-form-field">
          <div>
            <label htmlFor="title">Title</label>
          </div>

          <div className="recipe-create-form-input-wrapper">
            <input
              className={`${errors.title ? "error" : ""}`}
              id="title"
              type="text"
              {...register("title", {
                required: "Title is required.",
              })}
            />
          </div>

          {errors.title && (
            <div className="field-error-text">{errors.title.message}</div>
          )}
        </div>

        <div className="recipe-create-form-actions">
          <button className="button-primary" type="submit">
            <Spinner spin={isSubmitting}>
              <FontAwesomeIcon icon={faCirclePlus} />
            </Spinner>{" "}
            Create recipe
          </button>
        </div>
      </form>
    </div>
  );
}

export default RecipeCreateForm;
