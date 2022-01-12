import Container from "../components/Container";
import { buildTitle } from "../lib/utils";
import { Helmet } from "react-helmet-async";

function NotFound() {
  return (
    <>
      <Helmet>
        <title>{buildTitle("Not Found")}</title>
      </Helmet>
      <Container variant="viewport">
        <Container variant="content">
          <div>NotFound</div>
        </Container>
      </Container>
    </>
  );
}

export default NotFound;
