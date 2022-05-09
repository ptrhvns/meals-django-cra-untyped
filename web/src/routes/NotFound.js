import Alert from "../components/Alert";
import PageLayout from "../components/PageLayout";
import { buildTitle } from "../lib/utils";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="not-found">
      <Helmet>
        <title>{buildTitle("Not Found (404)")}</title>
      </Helmet>

      <PageLayout>
        <div>
          <h1>Not Found (404)</h1>

          <Alert className="not-found__alert" variant="error">
            We couldn't find the resource you requested. Maybe you can find what
            you were looking for by visiting the <Link to="/">home page</Link>.
          </Alert>
        </div>
      </PageLayout>
    </div>
  );
}

export default NotFound;
