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

function RecipeSectionEmptyContent({ children, data }) {
  return isEmpty(data) ? (
    <p className="recipe-section-empty-content__notice">{children()}</p>
  ) : null;
}

RecipeSectionEmptyContent.defaultProps = defaultProps;
RecipeSectionEmptyContent.propTypes = propTypes;

export default RecipeSectionEmptyContent;
