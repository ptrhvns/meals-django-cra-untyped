import Container from "../components/Container";
import { buildTitle } from "../lib/utils";
import { Helmet } from "react-helmet-async";

function Signup() {
  return (
    <div>
      <Helmet>
        <title>{buildTitle("Signup")}</title>
      </Helmet>

      <Container variant="viewport">
        <Container variant="content">
          <div>Signup</div>
        </Container>
      </Container>
    </div>
  );
}

export default Signup;
