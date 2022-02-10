import Container from "./Container";
import PropTypes from "prop-types";
import useAuthn from "../hooks/useAuthn";
import { faBars, faCookieBite } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { join } from "lodash";
import { Link } from "react-router-dom";
import { post } from "../lib/api";
import { useEffect, useRef, useState } from "react";

const propTypes = {
  className: PropTypes.string,
};

const defaultProps = {
  className: "",
};

function Navbar({ className }) {
  const [showMenu, setShowMenu] = useState(false);
  const authn = useAuthn();
  const menuRef = useRef(null);

  const cn = join(["navbar", className], " ");

  const handleOutsideMenuClick = (event) => {
    /* istanbul ignore next */
    if (!menuRef.current) return;

    if (menuRef.current.contains(event.target)) return;
    setShowMenu(false);
  };

  useEffect(() => {
    document.addEventListener("click", handleOutsideMenuClick);
    return () => document.removeEventListener("click", handleOutsideMenuClick);
  }, []);

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
                  <span className="navbar-menu-list-wrapper">
                    <ul
                      className="navbar-menu-list"
                      data-testid="navbar-menu-list"
                    >
                      <li>
                        <button
                          className="button-link"
                          onClick={handleLogout}
                          type="button"
                        >
                          Log out
                        </button>
                      </li>
                    </ul>
                  </span>
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
