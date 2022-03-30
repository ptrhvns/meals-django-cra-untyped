import Alert from "./Alert";
import FieldError from "./FieldError";
import Spinner from "./Spinner";
import useAuthn from "../hooks/useAuthn";
import { faSignInAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { handleResponseErrors } from "../lib/utils";
import { pick } from "lodash";
import { post } from "../lib/api";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

function LoginForm() {
  const [alertMessage, setAlertMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const authn = useAuthn();
  const location = useLocation();
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
      data: pick(data, ["password", "username"]),
      route: "login",
    });
    setIsSubmitting(false);

    if (response.isError) {
      handleResponseErrors({ response, setAlertMessage, setError });
      return;
    }

    authn.login(() =>
      navigate(location.state?.from?.pathname || "/dashboard", {
        replace: true,
      })
    );
  };

  return (
    <div className="login-form">
      <form onSubmit={handleSubmit(onSubmit)}>
        {alertMessage && (
          <Alert
            className="login-form-alert"
            onDismiss={() => setAlertMessage(null)}
            variant="error"
          >
            {alertMessage}
          </Alert>
        )}

        <div className="login-form-field">
          <div>
            <label htmlFor="username">Username</label>
          </div>

          <div className="login-form-input-wrapper">
            <input
              className={`${errors.username ? "error" : ""}`}
              id="username"
              type="text"
              {...register("username", {
                required: "Username is required.",
              })}
            />
          </div>

          <FieldError
            className="login-form__field-error"
            error={errors?.username?.message}
          />
        </div>

        <div className="login-form-field">
          <div>
            <div>
              <label htmlFor="password">Password</label>
            </div>

            <div className="login-form-input-wrapper">
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
              className="login-form__field-error"
              error={errors?.password?.message}
            />
          </div>
        </div>

        <div className="login-form-actions">
          <button className="button-primary" type="submit">
            <Spinner spin={isSubmitting}>
              <FontAwesomeIcon icon={faSignInAlt} />
            </Spinner>{" "}
            Log in
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;
