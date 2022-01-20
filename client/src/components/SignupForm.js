import Alert from "./Alert";
import PropTypes from "prop-types";
import { faPlusCircle, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { forOwn, head } from "lodash";
import { Link } from "react-router-dom";
import { post } from "../lib/api";
import { useForm } from "react-hook-form";
import { useState } from "react";

const propTypes = {
  setShowConfirmation: PropTypes.func.isRequired,
};

function SignupForm({ setShowConfirmation }) {
  const [alertMessage, setAlertMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const response = await post({ data, route: "signup" });
    setIsSubmitting(false);

    if (response.isError) {
      setAlertMessage(response.message);

      forOwn(response.errors, (value, key) => {
        setError(key, { message: head(value), type: "manual" });
      });

      return;
    }

    setShowConfirmation(true);
  };

  return (
    <div className="signup-form">
      <form onSubmit={handleSubmit(onSubmit)}>
        {alertMessage && (
          <Alert
            className="signup-form-alert"
            onDismiss={() => setAlertMessage(null)}
            variant="error"
          >
            {alertMessage}
          </Alert>
        )}

        <div className="signup-form-field">
          <div>
            <label htmlFor="username">Username</label>
          </div>

          <div className="signup-form-input-wrapper">
            <input
              className={`${errors.username ? "error" : ""}`}
              id="username"
              type="username"
              {...register("username", { required: "Username is required." })}
            />
          </div>

          {errors.username && (
            <div className="field-error-text">{errors.username.message}</div>
          )}
        </div>

        <div className="signup-form-field">
          <div>
            <label htmlFor="email">Email</label>
          </div>

          <div className="signup-form-input-wrapper">
            <input
              className={`${errors.email ? "error" : ""}`}
              id="email"
              type="email"
              {...register("email", { required: "Email is required." })}
            />
          </div>

          {errors.email && (
            <div className="field-error-text">{errors.email.message}</div>
          )}
        </div>

        <div className="signup-form-field">
          <div>
            <label htmlFor="password">Password</label>
          </div>

          <div className="signup-form-input-wrapper">
            <input
              className={`${errors.password ? "error" : ""}`}
              id="password"
              type="password"
              {...register("password", { required: "Password is required." })}
            />
          </div>

          {errors.password && (
            <div className="field-error-text">{errors.password.message}</div>
          )}
        </div>

        <div className="signup-form-actions">
          <button className="button-primary" type="submit">
            {isSubmitting ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <FontAwesomeIcon icon={faPlusCircle} />
            )}{" "}
            Create account
          </button>
        </div>
      </form>

      <p className="signup-agreements">
        By creating an account with us, you agree to our{" "}
        <Link to="/terms-and-conditions">Terms and Conditions</Link>, and to our{" "}
        <Link to="/privacy-policy">Privacy Policy</Link>.
      </p>
    </div>
  );
}

SignupForm.propTypes = propTypes;

export default SignupForm;
