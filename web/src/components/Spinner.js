import PropTypes from "prop-types";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const propTypes = {
  children: PropTypes.node.isRequired,
  spin: PropTypes.bool.isRequired,
};

function Spinner({ children, spin }) {
  return spin ? <FontAwesomeIcon icon={faSpinner} spin /> : children;
}

Spinner.propTypes = propTypes;

export default Spinner;
