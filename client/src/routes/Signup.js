import Container from "../components/Container";
import { buildTitle } from "../lib/utils";
import { faCookieBite, faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

function Signup() {
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

                <form className="signup-form">
                  <div className="signup-form-field">
                    <div>
                      <label>Email</label>
                    </div>

                    <div className="signup-input-wrapper">
                      <input type="text" />
                    </div>
                  </div>

                  <div className="signup-form-field">
                    <div>
                      <label>Password</label>
                    </div>

                    <div className="signup-input-wrapper">
                      <input type="password" />
                    </div>
                  </div>

                  <div className="signup-form-actions">
                    <button className="button-primary" type="submit">
                      <FontAwesomeIcon icon={faPlusCircle} /> Create account
                    </button>
                  </div>
                </form>

                <p className="signup-agreements">
                  By creating an account with us, you agree to our{" "}
                  <Link to="/terms-and-conditions">Terms and Conditions</Link>,{" "}
                  and to our <Link to="/privacy-policy">Privacy Policy</Link>.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Container>
    </div>
  );
}

export default Signup;
