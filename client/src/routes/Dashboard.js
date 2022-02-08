import Container from "../components/Container";
import Navbar from "../components/Navbar";
import { buildTitle } from "../lib/utils";
import { Helmet } from "react-helmet-async";

function Dashboard() {
  return (
    <div>
      <Helmet>
        <title>{buildTitle("Dashboard")}</title>
      </Helmet>

      <Navbar />

      <Container variant="viewport">
        <Container variant="content">
          <div>Dashboard</div>
        </Container>
      </Container>
    </div>
  );
}

export default Dashboard;
