import PropTypes from "prop-types";
import { isEmpty } from "lodash";

const propTypes = {
  children: PropTypes.func,
  data: PropTypes.any,
};

const defaultProps = {
  children: null,
  data: null,
};

function RecipeSectionContent({ children, data }) {
  return !isEmpty(data) ? (
    <div className="recipe-section-content__wrapper">{children()}</div>
  ) : null;
}

RecipeSectionContent.defaultProps = defaultProps;
RecipeSectionContent.propTypes = propTypes;

export default RecipeSectionContent;
