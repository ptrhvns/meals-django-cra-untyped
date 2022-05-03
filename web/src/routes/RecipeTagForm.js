import Alert from "../components/Alert";
import Container from "../components/Container";
import FieldError from "../components/FieldError";
import Navbar from "../components/Navbar";
import RecipeLoading from "../components/RecipeLoading";
import Spinner from "../components/Spinner";
import { buildTitle } from "../lib/utils";
import { compact, join, pick } from "lodash";
import {
  faCircleMinus,
  faCirclePlus,
  faSquarePen,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { get, post } from "../lib/api";
import { handleResponseErrors } from "../lib/utils";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

function RecipeTagForm() {
  const { recipeId, tagId } = useParams();

  const [alertMessage, setAlertMessage] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(tagId ? true : false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  const navigate = useNavigate();
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
    setValue,
  } = useForm();

  useEffect(() => {
    if (tagId) {
      get({
        route: "recipeTag",
        routeData: { tagId },
      }).then((response) => {
        // istanbul ignore next
        if (response.isError) {
          setLoadingError(response.message);
        } else {
          setValue("name", response.data.name);
        }

        setIsLoading(false);
      });
    }
  }, [tagId, setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    const response = await post({
      data: pick(data, ["name"]),
      route: tagId ? "updateRecipeTag" : "recipeTagCreate",
      routeData: { recipeId, tagId },
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

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this tag?")) {
      return;
    }

    setIsDeleting(true);

    const response = await post({
      route: "deleteRecipeTag",
      routeData: { tagId },
    });

    setIsDeleting(false);

    if (response.isError) {
      setAlertMessage(response.message);
      return;
    }

    navigate(`/recipe/${recipeId}`);
  };

  return (
    <div className="recipe-tag-form">
      <Helmet>
        <title>{buildTitle(`${tagId ? "Edit" : "New"} Recipe Tag`)}</title>
      </Helmet>

      <Navbar />

      <Container className="recipe-tag-form__viewport" variant="viewport">
        <Container className="recipe-tag-form__content" variant="content">
          <div className="recipe-tag-form__content-card">
            <h2>{tagId ? "Edit " : "New"} Recipe Tag</h2>

            <RecipeLoading
              className="recipe-tag-form__alert"
              error={loadingError}
              isLoading={isLoading}
            >
              {() => (
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
                    <div className="recipe-tag-form__actions-left">
                      <button
                        className="button-primary recipe-tag-form__action"
                        type="submit"
                      >
                        <Spinner spin={isSubmitting}>
                          <FontAwesomeIcon
                            icon={tagId ? faSquarePen : faCirclePlus}
                          />
                        </Spinner>{" "}
                        Save
                      </button>

                      <button
                        className="recipe-tag-form__action"
                        onClick={handleDismissForm}
                        type="button"
                      >
                        Dismiss
                      </button>
                    </div>

                    {tagId && (
                      <div className="recipe-tag-form__actions-right">
                        <button
                          className="button-danger recipe-tag-form__action"
                          onClick={handleDelete}
                          type="button"
                        >
                          <Spinner spin={isDeleting}>
                            <FontAwesomeIcon icon={faCircleMinus} />
                          </Spinner>{" "}
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </form>
              )}
            </RecipeLoading>
          </div>
        </Container>
      </Container>
    </div>
  );
}

export default RecipeTagForm;
