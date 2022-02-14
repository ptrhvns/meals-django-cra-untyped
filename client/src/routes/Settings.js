import Container from "../components/Container";
import DeleteAccountForm from "../components/DeleteAccountForm";
import Navbar from "../components/Navbar";
import { buildTitle } from "../lib/utils";
import { Helmet } from "react-helmet-async";

function Settings() {
  return (
    <div className="settings">
      <Helmet>
        <title>{buildTitle("Settings")}</title>
      </Helmet>

      <Navbar />

      <Container variant="viewport">
        <Container variant="content">
          <h1>Settings</h1>

          <h2>Account</h2>

          <h3 className="settings-delete-account-header">Delete my account</h3>
          <p>
            This will permanently delete your account and all associated data.
          </p>
          <DeleteAccountForm />
        </Container>
      </Container>
    </div>
  );
}

export default Settings;