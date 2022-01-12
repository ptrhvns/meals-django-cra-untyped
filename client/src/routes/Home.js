import Container from "../components/Container";
import { buildTitle } from "../lib/utils";
import { Helmet } from "react-helmet-async";

function Home() {
  return (
    <>
      <Helmet>
        <title>{buildTitle("Home")}</title>
      </Helmet>
      <Container variant="viewport">
        <Container variant="content">
          <div>Home</div>
        </Container>
      </Container>
    </>
  );
}

export default Home;
