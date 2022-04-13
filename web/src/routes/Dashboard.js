import Container from "../components/Container";
import Navbar from "../components/Navbar";
import RecipeList from "../components/RecipeList";
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
          <RecipeList />
        </Container>
      </Container>
    </div>
  );
}

export default Dashboard;
