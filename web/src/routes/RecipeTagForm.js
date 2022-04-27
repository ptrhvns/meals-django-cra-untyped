import Alert from "../components/Alert";
import Container from "../components/Container";
import FieldError from "../components/FieldError";
import Navbar from "../components/Navbar";
import Spinner from "../components/Spinner";
import { buildTitle } from "../lib/utils";
import { compact, join, pick } from "lodash";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { handleResponseErrors } from "../lib/utils";
import { Helmet } from "react-helmet-async";
import { post } from "../lib/api";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

function RecipeTagForm() {
  const [alertMessage, setAlertMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm();
  const { recipeId } = useParams();

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    const response = await post({
      data: pick(data, ["name"]),
      route: "addRecipeTag",
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

  return (
    <div className="recipe-tag-form">
      <Helmet>
        <title>{buildTitle("Add Recipe Tag")}</title>
      </Helmet>

      <Navbar />

      <Container className="recipe-tag-form__viewport" variant="viewport">
        <Container className="recipe-tag-form__content" variant="content">
          <div className="recipe-tag-form__content-card">
            <h2>Add Recipe Tag</h2>

            <form
              className="recipe-tag-form__form"
              onSubmit={handleSubmit(onSubmit)}
            >
              {alertMessage && (
                <Alert
                  className="recipe-tag-form__alert"
                  onDismiss={handleDismissAlert}
                  variant="error"
                >
                  {alertMessage}
                </Alert>
              )}

              <div className="recipe-tag-form__field">
                <div>
                  <label htmlFor="recipe-tag-input-name">Name</label>
                </div>

                <div className="recipe-tag-form__input-wrapper">
                  <input
                    className={join(
                      compact([
                        errors.name && "error",
                        "recipe-tag-form__input",
                      ]),
                      " "
                    )}
                    id="recipe-tag-input-name"
                    type="text"
                    {...register("name", {
                      required: "Name is required.",
                    })}
                  />
                </div>

                <FieldError
                  className="recipe-tag-form__field-error"
                  error={errors?.name?.message}
                />
              </div>

              <div className="recipe-tag-form__actions">
                <button className="button-primary" type="submit">
                  <Spinner spin={isSubmitting}>
                    <FontAwesomeIcon icon={faCirclePlus} />
                  </Spinner>{" "}
                  Add
                </button>

                <button onClick={handleDismissForm} type="button">
                  Dismiss
                </button>
              </div>
            </form>
          </div>
        </Container>
      </Container>
    </div>
  );
}

export default RecipeTagForm;
