import Alert from "../components/Alert";
import Container from "../components/Container";
import { buildTitle } from "../lib/utils";
import { compact, head, join } from "lodash";
import { faCookieBite, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { post } from "../lib/api";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function SignupConfirmation() {
  const [isConfirming, setIsConfirming] = useState(true);
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState(null);
  const params = useParams();

  useEffect(() => {
    (async () => {
      const response = await post({
        data: { token: params.token },
        route: "signupConfirmation",
      });

      if (response.isError) {
        setIsError(true);
        setMessage(
          join(compact([response.message, head(response.errors?.token)]), " ")
        );
      }

      setMessage(response.message);
      setIsConfirming(false);
    })();
  }, [params, setIsConfirming, setIsError, setMessage]);

  return (
    <div className="signup-confirmation">
      <Helmet>
        <title>{buildTitle("Signup Confirmation")}</title>
      </Helmet>

      <Container className="signup-confirmation-viewport" variant="viewport">
        <Container variant="content">
          <div className="signup-confirmation-content-wrapper">
            <div className="signup-confirmation-content">
              <Link className="signup-confirmation-home-link" to="/">
                <FontAwesomeIcon icon={faCookieBite} /> Meals
              </Link>

              <div className="signup-confirmation-message-wrapper">
                {isConfirming ? (
                  <Alert variant="info">
                    <FontAwesomeIcon icon={faSpinner} spin />{" "}
                    <span className="signup-confirmation-message-info-text">
                      Confirming your signup...
                    </span>
                  </Alert>
                ) : (
                  <Alert variant={isError ? "error" : "success"}>
                    <div>
                      {message}
                      {isError ? (
                        <p>
                          Please double check the address you visited to make
                          sure it's correct, or you can try{" "}
                          <Link to="/signup">signing up</Link>.
                        </p>
                      ) : (
                        <p>
                          You may now <Link to="/login">log in</Link> to your
                          new account.
                        </p>
                      )}
                    </div>
                  </Alert>
                )}
              </div>
            </div>
          </div>
        </Container>
      </Container>
    </div>
  );
}

export default SignupConfirmation;
