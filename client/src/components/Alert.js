import PropTypes from "prop-types";
import React from "react";
import { compact, join } from "lodash";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  onDismiss: PropTypes.func,
  variant: PropTypes.oneOf(["error", "info", "success"]).isRequired,
};

const defaultProps = {
  className: null,
  onDismiss: null,
};

function Alert({ children, className, onDismiss, variant }) {
  const cn = join(compact(["alert", `alert-${variant}`, className]), " ");

  return (
    <div className={cn}>
      <div>{children}</div>
      {onDismiss && (
        <div>
          <button className="alert-button" onClick={onDismiss} type="button">
            <FontAwesomeIcon icon={faTimes} />
            <span className="sr-only">Dismiss</span>
          </button>
        </div>
      )}
    </div>
  );
}

Alert.propTypes = propTypes;
Alert.defaultProps = defaultProps;

export default Alert;
