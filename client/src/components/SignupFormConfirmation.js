import Alert from "./Alert";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function SignupFormConfirmation() {
  return (
    <Alert variant="success">
      <FontAwesomeIcon icon={faExclamationCircle} /> You were successfully
      signed up! To activate your account, please visit your email, and follow
      the instructions in the confirmation message we sent you.
    </Alert>
  );
}

export default SignupFormConfirmation;
