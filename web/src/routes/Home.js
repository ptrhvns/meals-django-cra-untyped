import Container from "../components/Container";
import Navbar from "../components/Navbar";
import { buildTitle } from "../lib/utils";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home">
      <Helmet>
        <title>{buildTitle("Home")}</title>
      </Helmet>

      <Navbar />

      <Container variant="viewport">
        <Container variant="content">
          <div className="home-hero-wrapper">
            <div className="home-hero">
              <h1 className="home-hero-header">Meals made easy.</h1>

              <p className="home-hero-subheader">
                Manage recipes, menus, shopping lists, grocery stores, and much
                more.
              </p>

              <Link className="home-hero-call-to-action" to="/signup">
                Create a free account
              </Link>
            </div>
          </div>
        </Container>
      </Container>
    </div>
  );
}

export default Home;
