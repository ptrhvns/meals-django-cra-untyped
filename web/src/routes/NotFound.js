import Container from "../components/Container";
import Navbar from "../components/Navbar";
import { buildTitle } from "../lib/utils";
import { Helmet } from "react-helmet-async";

function NotFound() {
  return (
    <div>
      <Helmet>
        <title>{buildTitle("Not Found")}</title>
      </Helmet>

      <Navbar />

      <Container variant="viewport">
        <Container variant="content">
          <div>NotFound</div>
        </Container>
      </Container>
    </div>
  );
}

export default NotFound;
