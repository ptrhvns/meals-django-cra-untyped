import Alert from "../components/Alert";
import PropTypes from "prop-types";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { join } from "lodash";

const propTypes = {
  children: PropTypes.func.isRequired,
  className: PropTypes.string,
  error: PropTypes.string,
  isLoading: PropTypes.bool.isRequired,
};

const defaultProps = {
  className: "",
  error: null,
};

function RecipeLoading({ children, className, error, isLoading }) {
  const cn = join(["recipe-loading", className], " ");

  if (isLoading) {
    return (
      <div className={cn}>
        <FontAwesomeIcon icon={faSpinner} spin /> Loading
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn}>
        <Alert variant="error">{error}</Alert>);
      </div>
    );
  }

  return children();
}

RecipeLoading.defaultProps = defaultProps;
RecipeLoading.propTypes = propTypes;

export default RecipeLoading;
