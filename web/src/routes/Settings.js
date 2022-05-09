import AccountDeleteForm from "../components/AccountDeleteForm";
import PageLayout from "../components/PageLayout";
import { buildTitle } from "../lib/utils";
import { Helmet } from "react-helmet-async";

function Settings() {
  return (
    <div className="settings">
      <Helmet>
        <title>{buildTitle("Settings")}</title>
      </Helmet>

      <PageLayout className="settings__content" variant="content">
        <h1>Settings</h1>

        <h2 className="settings__subheader">Account</h2>

        <h3 className="settings__subheader settings__delete-account-header">
          Delete my account
        </h3>

        <p>
          This will permanently delete your account and all associated data.
        </p>

        <AccountDeleteForm />
      </PageLayout>
    </div>
  );
}

export default Settings;
