import Alert from "./Alert";
import FieldError from "./FieldError";
import Spinner from "./Spinner";
import useAuthn from "../hooks/useAuthn";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { handleResponseErrors } from "../lib/utils";
import { pick } from "lodash";
import { post } from "../lib/api";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function AccountDeleteForm() {
  const [alertMessage, setAlertMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const authn = useAuthn();
  const navigate = useNavigate();

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm();

  const handleHideForm = () => {
    setShowForm(false);
    reset();
    setAlertMessage(null);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const response = await post({
      data: pick(data, ["password"]),
      route: "accountDestroy",
    });
    setIsSubmitting(false);

    if (response.isError) {
      handleResponseErrors({ response, setAlertMessage, setError });
      return;
    }

    authn.logout(() => navigate("/"));
  };

  return (
    <div className="account-delete-form">
      {showForm ? (
        <form
          data-testid="account-delete-form-form"
          onSubmit={handleSubmit(onSubmit)}
        >
          {alertMessage && (
            <Alert
              className="account-delete-form-alert"
              onDismiss={() => setAlertMessage(null)}
              variant="error"
            >
              {alertMessage}
            </Alert>
          )}

          <div className="account-delete-form-field">
            <div>
              <label htmlFor="password">Password</label>
            </div>

            <div className="account-delete-form-input-wrapper">
              <input
                className={`${errors.password ? "error" : ""}`}
                id="password"
                type="password"
                {...register("password", {
                  required: "Password is required.",
                })}
              />
            </div>

            <FieldError
              className="account-delete-form__field-error"
              error={errors?.password?.message}
            />
          </div>

          <div className="account-delete-form-actions">
            <button className="button-danger" type="submit">
              <Spinner spin={isSubmitting}>
                <FontAwesomeIcon icon={faTrashCan} />
              </Spinner>{" "}
              Delete my account
            </button>

            <button onClick={handleHideForm} type="button">
              Dismiss
            </button>
          </div>
        </form>
      ) : (
        <>
          <button
            className="button-danger"
            onClick={() => setShowForm(true)}
            type="button"
          >
            Delete my account
          </button>
        </>
      )}
    </div>
  );
}

export default AccountDeleteForm;
