import PropTypes from "prop-types";
import useAuthn from "../hooks/useAuthn";
import { Navigate, useLocation } from "react-router-dom";

const propTypes = {
  children: PropTypes.node.isRequired,
};

function RequireAuthn({ children }) {
  const authn = useAuthn();
  const location = useLocation();

  if (!authn.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

RequireAuthn.propTypes = propTypes;

export default RequireAuthn;
