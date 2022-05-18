import Alert from "../components/Alert";
import FieldError from "../components/FieldError";
import PageLayout from "../components/PageLayout";
import RecipeLoading from "../components/RecipeLoading";
import Spinner from "../components/Spinner";
import { buildTitle } from "../lib/utils";
import { compact, join, pick } from "lodash";
import { faCircleMinus, faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { get, post } from "../lib/api";
import { handleResponseErrors } from "../lib/utils";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

function RecipeTimeForm() {
  const [alertMessage, setAlertMessage] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  const navigate = useNavigate();
  const { recipeId, timeId } = useParams();

  const [isLoading, setIsLoading] = useState(timeId ? true : false);

  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
    setValue,
  } = useForm();

  useEffect(() => {
    if (timeId) {
      get({
        route: "recipeTime",
        routeData: { timeId },
      }).then((response) => {
        // istanbul ignore next
        if (response.isError) {
          setLoadingError(response.message);
        } else {
          ["days", "hours", "minutes", "note", "time_type"].forEach((key) => {
            setValue(key, response.data[key]);
          });
        }

        setIsLoading(false);
      });
    }
  }, [timeId, setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    const response = await post({
      data: pick(data, ["days", "hours", "minutes", "note", "time_type"]),
      route: timeId ? "recipeTimeUpdate" : "recipeTimeCreate",
      routeData: { recipeId, timeId },
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
    if (!window.confirm("Are you sure you want to delete this time?")) {
      return;
    }

    setIsDeleting(true);

    const response = await post({
      route: "recipeTimeDestroy",
      routeData: { timeId },
    });

    setIsDeleting(false);

    if (response.isError) {
      setAlertMessage(response.message);
      return;
    }

    navigate(`/recipe/${recipeId}`);
  };

  return (
    <div className="recipe-time-form">
      <Helmet>
        <title>{buildTitle(`${timeId ? "Edit" : "New"} Recipe Time`)}</title>
      </Helmet>

      <PageLayout contentClassName="recipe-time-form__content">
        <h1>{timeId ? "Edit" : "New"} Recipe Time</h1>

        <RecipeLoading
          className="recipe-time-form__alert"
          error={loadingError}
          isLoading={isLoading}
        >
          {() => (
            <form
              className="recipe-time-form__form"
              onSubmit={handleSubmit(onSubmit)}
            >
              {alertMessage && (
                <Alert
                  className="recipe-time-form__alert"
                  onDismiss={handleDismissAlert}
                  variant="error"
                >
                  {alertMessage}
                </Alert>
              )}

              <div className="recipe-time-form__field">
                <div>
                  <label htmlFor="time-type">Type</label>
                </div>

                <div className="recipe-time-form__input-wrapper">
                  <select
                    className={join(
                      compact([
                        errors.time_type && "error",
                        "recipe-time-form__input",
                      ]),
                      " "
                    )}
                    id="time-type"
                    name="time_type"
                    {...register("time_type", {
                      required: "Type is required.",
                    })}
                  >
                    <option value="">-- Select a type --</option>
                    <option value="Additional">Addtional</option>
                    <option value="Cook">Cook</option>
                    <option value="Preparation">Preparation</option>
                    <option value="Total">Total</option>
                  </select>
                </div>

                <FieldError
                  className="recipe-time-form__field-error"
                  error={errors?.time_type?.message}
                />
              </div>

              <div className="recipe-time-form__units">
                <div>
                  <div>
                    <label htmlFor="days">Days</label>
                  </div>

                  <div>
                    <input
                      className={join(
                        compact([
                          errors.days && "error",
                          "recipe-time-form__unit-input",
                        ]),
                        " "
                      )}
                      id="days"
                      inputMode="numeric"
                      noValidate
                      pattern="[0-9]*"
                      type="text"
                      {...register("days")}
                    />
                  </div>

                  <FieldError
                    className="recipe-time-form__field-error"
                    error={errors?.days?.message}
                  />
                </div>

                <div>
                  <div>
                    <label htmlFor="hours">Hours</label>
                  </div>

                  <div>
                    <input
                      className={join(
                        compact([
                          errors.hours && "error",
                          "recipe-time-form__unit-input",
                        ]),
                        " "
                      )}
                      id="hours"
                      inputMode="numeric"
                      noValidate
                      pattern="[0-9]*"
                      type="text"
                      {...register("hours")}
                    />
                  </div>

                  <FieldError
                    className="recipe-time-form__field-error"
                    error={errors?.hours?.message}
                  />
                </div>

                <div>
                  <div>
                    <label htmlFor="minutes">Minutes</label>
                  </div>

                  <div>
                    <input
                      className={join(
                        compact([
                          errors.minutes && "error",
                          "recipe-time-form__unit-input",
                        ]),
                        " "
                      )}
                      id="minutes"
                      inputMode="numeric"
                      noValidate
                      pattern="[0-9]*"
                      type="text"
                      {...register("minutes")}
                    />
                  </div>

                  <FieldError
                    className="recipe-time-form__field-error"
                    error={errors?.minutes?.message}
                  />
                </div>
              </div>

              <div className="recipe-time-form__field">
                <div>
                  <label htmlFor="note">Note (optional)</label>
                </div>

                <div className="recipe-time-form__input-wrapper">
                  <input
                    className={join(
                      compact([
                        errors.note && "error",
                        "recipe-time-form__unit-input",
                      ]),
                      " "
                    )}
                    id="note"
                    type="text"
                    {...register("note")}
                  />
                </div>

                <FieldError
                  className="recipe-time-form__field-error"
                  error={errors?.note?.message}
                />
              </div>

              <div className="recipe-time-form__actions">
                <div className="recipe-time-form__actions-left">
                  <button
                    className="button-primary recipe-time-form__action"
                    type="submit"
                  >
                    <Spinner spin={isSubmitting}>
                      <FontAwesomeIcon icon={faCirclePlus} />
                    </Spinner>{" "}
                    Save
                  </button>

                  <button
                    className="recipe-time-form__action"
                    onClick={handleDismissForm}
                    type="button"
                  >
                    Dismiss
                  </button>
                </div>

                {timeId && (
                  <div className="recipe-time-form__actions-right">
                    <button
                      className="button-danger recipe-time-form__action"
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
      </PageLayout>
    </div>
  );
}

export default RecipeTimeForm;
