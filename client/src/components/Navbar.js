import Container from "./Container";
import PropTypes from "prop-types";
import useAuthn from "../hooks/useAuthn";
import { faCookieBite } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { join } from "lodash";
import { Link } from "react-router-dom";
import { post } from "../lib/api";

const propTypes = {
  className: PropTypes.string,
};

const defaultProps = {
  className: "",
};

function Navbar({ className }) {
  const authn = useAuthn();
  const cn = join(["navbar", className], " ");

  const handleLogout = async () => {
    await post({ route: "logout" });
    authn.logout();
  };

  return (
    <div className={cn}>
      <Container variant="viewport">
        <Container className="navbar-content" variant="content">
          <span className="navbar-logo">
            <Link to="/">
              <FontAwesomeIcon icon={faCookieBite} /> Meals
            </Link>
          </span>

          <nav>
            <ul className="navbar-primary-navigation">
              <li>
                {authn.isAuthenticated ? (
                  <button
                    className="button-link"
                    onClick={handleLogout}
                    type="button"
                  >
                    Log out
                  </button>
                ) : (
                  <Link to="/login">Log in</Link>
                )}
              </li>
            </ul>
          </nav>
        </Container>
      </Container>
    </div>
  );
}

Navbar.defaultProps = defaultProps;
Navbar.propTypes = propTypes;

export default Navbar;
