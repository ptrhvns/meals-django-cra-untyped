import Alert from "./Alert";
import FieldError from "./FieldError";
import Spinner from "./Spinner";
import useApi from "../hooks/useApi";
import useIsMounted from "../hooks/useIsMounted";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { handleResponseErrors } from "../lib/utils";
import { pick } from "lodash";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function RecipeForm() {
  const [alertMessage, setAlertMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { isUnmounted } = useIsMounted();
  const { post } = useApi();

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
      route: "recipeCreate",
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

    navigate(`/recipe/${response.data.id}`, { replace: true });
  };

  const handleDismissForm = () => {
    navigate("/");
  };

  return (
    <div className="recipe-form">
      <form onSubmit={handleSubmit(onSubmit)}>
        {alertMessage && (
          <Alert
            className="recipe-form__alert"
            onDismiss={() => setAlertMessage(null)}
            variant="error"
          >
            {alertMessage}
          </Alert>
        )}

        <div className="recipe-form__field">
          <div>
            <label htmlFor="title">Title</label>
          </div>

          <div className="recipe-form__input-wrapper">
            <input
              className={`${errors.title ? "error" : ""}`}
              id="title"
              type="text"
              {...register("title", {
                required: "Title is required.",
              })}
            />
          </div>

          <FieldError
            className="recipe-form__field-error"
            error={errors?.title?.message}
          />
        </div>

        <div className="recipe-form__actions">
          <button className="button-primary" type="submit">
            <Spinner spin={isSubmitting}>
              <FontAwesomeIcon icon={faCirclePlus} />
            </Spinner>{" "}
            Save and continue
          </button>

          <button onClick={handleDismissForm}>Dismiss</button>
        </div>
      </form>
    </div>
  );
}

export default RecipeForm;
