import Container from "../components/Container";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import PropTypes from "prop-types";
import { join } from "lodash";

const propTypes = {
  children: PropTypes.node.isRequired,
  contentClassName: PropTypes.string,
};

const defaultProps = {
  contentClassName: "",
};

function PageLayout({ children, contentClassName }) {
  const ccn = join(["page-layout__content", contentClassName], " ");

  return (
    <div className="page-layout">
      <Navbar />

      <Container className="page-layout__viewport" variant="viewport">
        <Container
          className={ccn}
          data-testid="page-layout__content"
          variant="content"
        >
          {children}
        </Container>
      </Container>

      <Footer />
    </div>
  );
}

PageLayout.propTypes = propTypes;
PageLayout.defaultProps = defaultProps;

export default PageLayout;
