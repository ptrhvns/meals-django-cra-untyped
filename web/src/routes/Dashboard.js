import PageLayout from "../components/PageLayout";
import RecipeList from "../components/RecipeList";
import { buildTitle } from "../lib/utils";
import { Helmet } from "react-helmet-async";

function Dashboard() {
  return (
    <div className="dashboard">
      <Helmet>
        <title>{buildTitle("Dashboard")}</title>
      </Helmet>

      <PageLayout>
        <RecipeList />
      </PageLayout>
    </div>
  );
}

export default Dashboard;
