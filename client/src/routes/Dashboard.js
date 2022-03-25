import Container from "../components/Container";
import Navbar from "../components/Navbar";
import { buildTitle } from "../lib/utils";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div>
      <Helmet>
        <title>{buildTitle("Dashboard")}</title>
      </Helmet>

      <Navbar />

      <Container variant="viewport">
        <Container variant="content">
          <Link to="/recipe-create">
            <FontAwesomeIcon icon={faCirclePlus} /> Create a recipe
          </Link>
        </Container>
      </Container>
    </div>
  );
}

export default Dashboard;
