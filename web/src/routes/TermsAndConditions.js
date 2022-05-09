import PageLayout from "../components/PageLayout";
import { buildTitle } from "../lib/utils";
import { Helmet } from "react-helmet-async";

function TermsAndConditions() {
  return (
    <div className="terms-and-conditions">
      <Helmet>
        <title>{buildTitle("Terms and Conditions")}</title>
      </Helmet>

      <PageLayout variant="content">
        <h1>Terms and Conditions</h1>

        <p className="terms-and-conditions__message">
          We're still working on this.
        </p>
      </PageLayout>
    </div>
  );
}

export default TermsAndConditions;
