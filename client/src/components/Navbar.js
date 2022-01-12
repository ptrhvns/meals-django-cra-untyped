import Container from "./Container";
import { faBars, faCookieBite } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <Container variant="viewport">
      <Container variant="content">
        <nav className="navbar">
          <span className="navbar-logo">
            <Link to="/">
              <FontAwesomeIcon icon={faCookieBite} /> Meals
            </Link>
          </span>

          <span className="navbar-menu">
            <Link to="/login">Log in</Link>
          </span>
        </nav>
      </Container>
    </Container>
  );
}

export default Navbar;
