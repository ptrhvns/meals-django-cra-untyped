import Container from "../components/Container";
import PropTypes from "prop-types";
import { faCookieBite } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

const propTypes = {
  children: PropTypes.node.isRequired,
};

function FullPageCard({ children }) {
  return (
    <div className="full-page-card">
      <Container className="full-page-card-viewport" variant="viewport">
        <Container variant="content">
          <div className="full-page-card-content-wrapper">
            <div className="full-page-card-content">
              <Link className="full-page-card-home-link" to="/">
                <FontAwesomeIcon icon={faCookieBite} /> Meals
              </Link>

              <div className="full-page-card-child-content">{children}</div>
            </div>
          </div>
        </Container>
      </Container>
    </div>
  );
}

FullPageCard.propTypes = propTypes;

export default FullPageCard;
