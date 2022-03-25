import Alert from "./Alert";
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
      data: pick(data, ["time_type", "days", "hours", "minutes"]),
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
    <form className="recipe-times-form" onSubmit={handleSubmit(onSubmit)}>
      {recipeTimesState.createFormAlertMessage && (
        <Alert
          className="recipe-times-form-alert"
          onDismiss={() =>
            recipeTimesDispatch({ type: "dismissCreateFormAlert" })
          }
          variant="error"
        >
          {recipeTimesState.createFormAlertMessage}
        </Alert>
      )}

      <div className="recipe-times-form-fields">
        <div className="recipe-times-form-field-group">
          <div>
            <label htmlFor="recipe-times-form-input-type">Type</label>
          </div>

          <div className="recipe-times-form-input-wrapper">
            <select
              className={join(
                compact([
                  errors.time_type && "error",
                  "recipe-times-form-input",
                ]),
                " "
              )}
              id="recipe-times-form-input-type"
              {...register("time_type", { required: "Type is required." })}
            >
              <option value="">Select a type...</option>
              <option value="Additional">Additional</option>
              <option value="Cook">Cook</option>
              <option value="Preparation">Preparation</option>
            </select>

            {errors.time_type && (
              <div className="field-error-text">{errors.time_type.message}</div>
            )}
          </div>
        </div>

        <div className="recipe-times-form-field-group recipe-times-form-field-units">
          <div className="recipe-times-form-field-unit">
            <div>
              <label htmlFor="recipe-times-form-input-days">Days</label>
            </div>

            <div className="recipe-times-form-input-wrapper">
              <input
                className={join(
                  compact([errors.days && "error", "recipe-times-form-input"]),
                  " "
                )}
                id="recipe-times-form-input-days"
                type="number"
                {...register("days", {
                  validate: validateUnitsOfTime,
                })}
              />
            </div>

            {errors.days && (
              <div className="field-error-text recipe-times-form-unit-error">
                {errors.days.message}
              </div>
            )}
          </div>

          <div className="recipe-times-form-field-unit">
            <div>
              <label htmlFor="recipe-times-form-input-hours">Hours</label>
            </div>

            <div className="recipe-times-form-input-wrapper">
              <input
                className={join(
                  compact([errors.hours && "error", "recipe-times-form-input"]),
                  " "
                )}
                id="recipe-times-form-input-hours"
                type="number"
                {...register("hours", {
                  validate: validateUnitsOfTime,
                })}
              />
            </div>

            {errors.hours && (
              <div className="field-error-text recipe-times-form-unit-error">
                {errors.hours.message}
              </div>
            )}
          </div>

          <div className="recipe-times-form-field-unit">
            <div>
              <label htmlFor="recipe-times-form-input-minutes">Minutes</label>
            </div>

            <div className="recipe-times-form-input-wrapper">
              <input
                className={join(
                  compact([
                    errors.minutes && "error",
                    "recipe-times-form-input",
                  ]),
                  " "
                )}
                id="recipe-times-form-input-minutes"
                type="number"
                {...register("minutes", { validate: validateUnitsOfTime })}
              />
            </div>

            {errors.minutes && (
              <div className="field-error-text recipe-times-form-unit-error">
                {errors.minutes.message}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="recipe-times-form-actions">
        <button
          className="button-primary recipe-times-form-action"
          disabled={isSubmitting}
          type="submit"
        >
          <Spinner spin={isSubmitting}>
            <FontAwesomeIcon icon={faCirclePlus} />
          </Spinner>{" "}
          Create
        </button>

        <button
          className="recipe-times-form-action"
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
