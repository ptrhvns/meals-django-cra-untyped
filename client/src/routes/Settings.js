import Container from "../components/Container";
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
          <div>Settings</div>
        </Container>
      </Container>
    </div>
  );
}

export default Settings;
