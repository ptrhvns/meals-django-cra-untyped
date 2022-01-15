import { faPlusCircle, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useForm } from "react-hook-form";
import { useState } from "react";

function SignupForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm();

  const onSubmit = async (data) => {
    // TODO implement form submission
    setIsSubmitting(true);
    console.log(data);
    await new Promise((r) => setTimeout(r, 500));
    setIsSubmitting(false);
  };

  return (
    <div className="signup-form">
      <form onSubmit={handleSubmit(onSubmit)}>
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
    </div>
  );
}

export default SignupForm;
