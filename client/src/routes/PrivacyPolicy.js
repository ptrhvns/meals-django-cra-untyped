import Container from "../components/Container";
import Navbar from "../components/Navbar";
import { buildTitle } from "../lib/utils";
import { Helmet } from "react-helmet-async";

function PrivacyPolicy() {
  return (
    <div>
      <Helmet>
        <title>{buildTitle("Not Found")}</title>
      </Helmet>

      <Navbar />

      <Container variant="viewport">
        <Container variant="content">
          <div>PrivacyPolicy</div>
        </Container>
      </Container>
    </div>
  );
}

export default PrivacyPolicy;
