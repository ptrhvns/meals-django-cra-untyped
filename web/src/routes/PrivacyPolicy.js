import PageLayout from "../components/PageLayout";
import { buildTitle } from "../lib/utils";
import { Helmet } from "react-helmet-async";

function PrivacyPolicy() {
  return (
    <div className="privacy-policy">
      <Helmet>
        <title>{buildTitle("Privacy Policy")}</title>
      </Helmet>

      <PageLayout>
        <h1>Privacy Policy</h1>

        <p className="privacy-policy__message">We're still working on this.</p>
      </PageLayout>
    </div>
  );
}

export default PrivacyPolicy;
