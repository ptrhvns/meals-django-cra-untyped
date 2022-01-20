import Container from "../components/Container";
import SignupForm from "../components/SignupForm";
import SignupFormConfirmation from "../components/SignupFormConfirmation";
import { buildTitle } from "../lib/utils";
import { faCookieBite } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useState } from "react";

function Signup() {
  const [showConfirmation, setShowConfirmation] = useState(false);

  return (
    <div className="signup">
      <Helmet>
        <title>{buildTitle("Create Account")}</title>
      </Helmet>

      <Container className="signup-viewport" variant="viewport">
        <Container variant="content">
          <div className="signup-content-wrapper">
            <div className="signup-content">
              <Link className="signup-home-link" to="/">
                <FontAwesomeIcon icon={faCookieBite} /> Meals
              </Link>

              <div className="signup-form-wrapper">
                <h1 className="signup-form-header">Create Account</h1>
                <p className="signup-form-subheader">
                  Make meals easy. Save time.
                </p>

                {showConfirmation ? (
                  <div className="signup-confirmation-wrapper">
                    <SignupFormConfirmation />
                  </div>
                ) : (
                  <SignupForm setShowConfirmation={setShowConfirmation} />
                )}
              </div>
            </div>
          </div>
        </Container>
      </Container>
    </div>
  );
}

export default Signup;
