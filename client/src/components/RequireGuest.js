import PropTypes from "prop-types";
import useAuthn from "../hooks/useAuthn";
import { Navigate } from "react-router-dom";

const propTypes = {
  children: PropTypes.node.isRequired,
};

function RequireGuest({ children }) {
  const authn = useAuthn();

  if (authn.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

RequireGuest.propTypes = propTypes;

export default RequireGuest;
