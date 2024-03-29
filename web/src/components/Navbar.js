import Container from "./Container";
import PropTypes from "prop-types";
import useApi from "../hooks/useApi";
import useAuthn from "../hooks/useAuthn";
import useOutsideClick from "../hooks/useOutsideClick";
import { faBars, faCookieBite } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { join } from "lodash";
import { Link } from "react-router-dom";
import { useState } from "react";

const propTypes = {
  className: PropTypes.string,
};

const defaultProps = {
  className: "",
};

function Navbar({ className }) {
  const [showMenu, setShowMenu] = useState(false);
  const authn = useAuthn();
  const menuRef = useOutsideClick(() => setShowMenu(false));
  const { post } = useApi();

  const cn = join(["navbar", className], " ");

  const handleLogout = async () => {
    await post({ route: "logout" });
    authn.logout();
  };

  const handleMenuButtonClick = (event) => {
    setShowMenu(!showMenu);
  };

  return (
    <div className={cn}>
      <Container variant="viewport">
        <Container className="navbar-content" variant="content">
          <span
            className="navbar-logo-wrapper"
            data-testid="navbar-logo-wrapper"
          >
            <Link to="/">
              <FontAwesomeIcon icon={faCookieBite} /> Meals
            </Link>
          </span>

          <nav className="navbar-menu-wrapper" ref={menuRef}>
            {authn.isAuthenticated ? (
              <>
                <button
                  className="button-link navbar-menu-button"
                  onClick={handleMenuButtonClick}
                  type="button"
                >
                  <FontAwesomeIcon icon={faBars} /> Menu
                </button>

                {showMenu && (
                  <div className="navbar-menu-list-wrapper">
                    <ul
                      className="navbar-menu-list"
                      data-testid="navbar-menu-list"
                    >
                      <li>
                        <Link to="/dashboard">Dashboard</Link>
                      </li>

                      <li>
                        <Link to="/settings">Settings</Link>
                      </li>

                      <li className="navbar-menu-group-first">
                        <button
                          className="button-link"
                          onClick={handleLogout}
                          type="button"
                        >
                          Log out
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <Link to="/login">Log in</Link>
            )}
          </nav>
        </Container>
      </Container>
    </div>
  );
}

Navbar.defaultProps = defaultProps;
Navbar.propTypes = propTypes;

export default Navbar;
