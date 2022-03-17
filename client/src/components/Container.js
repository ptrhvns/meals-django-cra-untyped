import PropTypes from "prop-types";
import { join } from "lodash";

const propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(["content", "viewport"]).isRequired,
};

const defaultProps = {
  className: "",
};

function Container({ children, className, variant }) {
  const cn = join([`container-${variant}`, className], " ");
  return <div className={cn}>{children}</div>;
}

Container.defaultProps = defaultProps;
Container.propTypes = propTypes;

export default Container;
