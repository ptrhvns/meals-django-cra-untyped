import AuthnContext from "../contexts/AuthnContext";
import PropTypes from "prop-types";
import { useState } from "react";

const propTypes = {
  children: PropTypes.node.isRequired,
};

function AuthnProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("isAuthenticated")
  );

  const login = (callback) => {
    localStorage.setItem("isAuthenticated", "true");
    setIsAuthenticated(true);

    if (callback) {
      callback();
    }
  };

  const logout = (callback) => {
    localStorage.removeItem("isAuthenticated");
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
