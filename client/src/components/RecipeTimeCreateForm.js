import Alert from "./Alert";
import FieldError from "./FieldError";
import PropTypes from "prop-types";
import Spinner from "./Spinner";
import { compact, isEmpty, join, pick, some } from "lodash";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { handleResponseErrors } from "../lib/utils";
import { post } from "../lib/api";
import { useState } from "react";

const propTypes = {
  createFormMethods: PropTypes.object.isRequired,
  recipeDispatch: PropTypes.func.isRequired,
  recipeState: PropTypes.object.isRequired,
  recipeTimesDispatch: PropTypes.func.isRequired,
  recipeTimesState: PropTypes.object.isRequired,
};

function RecipeTimesForm({
  createFormMethods,
  recipeDispatch,
  recipeState,
  recipeTimesDispatch,
  recipeTimesState,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    formState: { errors },
    getValues,
    handleSubmit,
    register,
    setError,
  } = createFormMethods;

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const response = await post({
      data: pick(data, ["days", "hours", "minutes", "time_type"]),
      route: "createRecipeTime",
      routeData: { recipeId: recipeState.id },
    });
    setIsSubmitting(false);

    if (response.isError) {
      handleResponseErrors({
        response,
        setAlertMessage: (message) =>
          recipeTimesDispatch({ type: "setCreateFormAlertMessage", message }),
        setError,
      });
      return;
    }

    recipeTimesDispatch({ type: "resetCreateForm", createFormMethods });
    recipeDispatch({ type: "addRecipeTime", data: response.data });
  };

  const handleDismissCreateForm = () => {
    recipeTimesDispatch({ type: "dismissCreateForm", createFormMethods });
  };

  const validateUnitsOfTime = () =>
    some(
      [getValues("days"), getValues("hours"), getValues("minutes")],
      (v) => !isEmpty(v)
    ) || "At least one unit is required.";

  return (
    <form className="recipe-time-create-form" onSubmit={handleSubmit(onSubmit)}>
      {recipeTimesState.createFormAlertMessage && (
        <Alert
          className="recipe-time-create-form-alert"
          onDismiss={() =>
            recipeTimesDispatch({ type: "dismissCreateFormAlert" })
          }
          variant="error"
        >
          {recipeTimesState.createFormAlertMessage}
        </Alert>
      )}

      <div className="recipe-time-create-form-fields">
        <div className="recipe-time-create-form-field-group">
          <div>
            <label htmlFor="recipe-time-create-form-input-type">Type</label>
          </div>

          <div className="recipe-time-create-form-input-wrapper">
            <select
              className={join(
                compact([
                  errors.time_type && "error",
                  "recipe-time-create-form-input",
                ]),
                " "
              )}
              id="recipe-time-create-form-input-type"
              {...register("time_type", { required: "Type is required." })}
            >
              <option value="">Select a type...</option>
              <option value="Additional">Additional</option>
              <option value="Cook">Cook</option>
              <option value="Preparation">Preparation</option>
            </select>

            <FieldError
              className="recipe-time-create-form__field-error"
              error={errors?.time_type?.message}
            />
          </div>
        </div>

        <div className="recipe-time-create-form-field-group recipe-time-create-form-field-units">
          <div className="recipe-time-create-form-field-unit">
            <div>
              <label htmlFor="recipe-time-create-form-input-days">Days</label>
            </div>

            <div className="recipe-time-create-form-input-wrapper">
              <input
                className={join(
                  compact([
                    errors.days && "error",
                    "recipe-time-create-form-input",
                  ]),
                  " "
                )}
                id="recipe-time-create-form-input-days"
                type="number"
                {...register("days", {
                  validate: validateUnitsOfTime,
                })}
              />
            </div>

            <FieldError
              className="recipe-time-create-form__field-error"
              error={errors?.days?.message}
            />
          </div>

          <div className="recipe-time-create-form-field-unit">
            <div>
              <label htmlFor="recipe-time-create-form-input-hours">Hours</label>
            </div>

            <div className="recipe-time-create-form-input-wrapper">
              <input
                className={join(
                  compact([
                    errors.hours && "error",
                    "recipe-time-create-form-input",
                  ]),
                  " "
                )}
                id="recipe-time-create-form-input-hours"
                type="number"
                {...register("hours", {
                  validate: validateUnitsOfTime,
                })}
              />
            </div>

            <FieldError
              className="recipe-time-create-form__field-error"
              error={errors?.hours?.message}
            />
          </div>

          <div className="recipe-time-create-form-field-unit">
            <div>
              <label htmlFor="recipe-time-create-form-input-minutes">
                Minutes
              </label>
            </div>

            <div className="recipe-time-create-form-input-wrapper">
              <input
                className={join(
                  compact([
                    errors.minutes && "error",
                    "recipe-time-create-form-input",
                  ]),
                  " "
                )}
                id="recipe-time-create-form-input-minutes"
                type="number"
                {...register("minutes", { validate: validateUnitsOfTime })}
              />
            </div>

            <FieldError
              className="recipe-time-create-form__field-error"
              error={errors?.minutes?.message}
            />
          </div>
        </div>
      </div>

      <div className="recipe-time-create-form-actions">
        <button
          className="button-primary recipe-time-create-form-action"
          disabled={isSubmitting}
          type="submit"
        >
          <Spinner spin={isSubmitting}>
            <FontAwesomeIcon icon={faCirclePlus} />
          </Spinner>{" "}
          Create
        </button>

        <button
          className="recipe-time-create-form-action"
          onClick={handleDismissCreateForm}
          type="button"
        >
          Dismiss
        </button>
      </div>
    </form>
  );
}

RecipeTimesForm.propTypes = propTypes;

export default RecipeTimesForm;
