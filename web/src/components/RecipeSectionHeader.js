import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const propTypes = {
  headerText: PropTypes.string.isRequired,
  linkText: PropTypes.string.isRequired,
  linkTo: PropTypes.string.isRequired,
};

function RecipeSectionHeader({ headerText, linkText, linkTo }) {
  return (
    <div className="recipe-section-header__wrapper">
      <h2 className="recipe-section-header__heading">{headerText}</h2>

      <Link className="recipe-section-header__action" to={linkTo}>
        {linkText}
      </Link>
    </div>
  );
}

RecipeSectionHeader.propTypes = propTypes;

export default RecipeSectionHeader;
