import Container from "../components/Container";
import Navbar from "../components/Navbar";
import { buildTitle } from "../lib/utils";
import { Helmet } from "react-helmet-async";

function TermsAndConditions() {
  return (
    <div>
      <Helmet>
        <title>{buildTitle("Terms and Conditions")}</title>
      </Helmet>

      <Navbar />

      <Container variant="viewport">
        <Container variant="content">
          <div>TermsAndConditions</div>
        </Container>
      </Container>
    </div>
  );
}

export default TermsAndConditions;
