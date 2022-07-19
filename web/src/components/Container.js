import PropTypes from "prop-types";
import { join } from "lodash";

const propTypes = {
  "data-testid": PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(["content", "viewport"]).isRequired,
};

const defaultProps = {
  "data-testid": "",
  className: "",
};

function Container({
  "data-testid": dataTestid,
  children,
  className,
  variant,
}) {
  const cn = join([`container-${variant}`, className], " ");
  const dt = dataTestid || `container-${variant}`;

  return (
    <div className={cn} data-testid={dt}>
      {children}
    </div>
  );
}

Container.defaultProps = defaultProps;
Container.propTypes = propTypes;

export default Container;
