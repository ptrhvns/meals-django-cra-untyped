import PropTypes from "prop-types";
import { compact, isEmpty, join } from "lodash";

const propTypes = {
  className: PropTypes.string,
  error: PropTypes.string,
};

const defaultProps = {
  className: null,
  error: null,
};

function FieldError({ className, error }) {
  if (isEmpty(error)) return null;
  const cn = join(compact(["field-error", className]), " ");
  return <div className={cn}>{error}</div>;
}

FieldError.propTypes = propTypes;
FieldError.defaultProps = defaultProps;

export default FieldError;
