import AuthnContext from "../contexts/AuthnContext";
import Cookies from "js-cookie";
import PropTypes from "prop-types";
import { useState } from "react";

const propTypes = {
  children: PropTypes.node.isRequired,
};

function AuthnProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!Cookies.get("isAuthenticated")
  );

  const login = (callback) => {
    Cookies.set("isAuthenticated", "true");
    setIsAuthenticated(true);

    if (callback) {
      callback();
    }
  };

  const logout = (callback) => {
    Cookies.remove("isAuthenticated");
    setIsAuthenticated(false);

    if (callback) {
      callback();
    }
  };

  const value = { isAuthenticated, login, logout };

  return (
    <AuthnContext.Provider value={value}>{children}</AuthnContext.Provider>
  );
}

AuthnProvider.propTypes = propTypes;

export default AuthnProvider;
