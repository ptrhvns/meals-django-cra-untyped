import Container from "./Container";
import PropTypes from "prop-types";
import { faCookieBite } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { join } from "lodash";
import { Link } from "react-router-dom";

const propTypes = {
  className: PropTypes.string,
};

const defaultProps = {
  className: "",
};

function Navbar({ className }) {
  const cn = join(["navbar", className], " ");

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
                <Link to="/login">Log in</Link>
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
