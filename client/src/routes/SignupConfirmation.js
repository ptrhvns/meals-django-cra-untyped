import { useParams } from "react-router-dom";

function SignupConfirmation() {
  // TODO implement component
  const params = useParams();
  return <div>SignupConfirmation {params.token}</div>;
}

export default SignupConfirmation;
