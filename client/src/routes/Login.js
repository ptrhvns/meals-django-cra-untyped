import Container from "../components/Container";
import { buildTitle } from "../lib/utils";
import { Helmet } from "react-helmet-async";

function Login() {
  return (
    <div>
      <Helmet>
        <title>{buildTitle("Login")}</title>
      </Helmet>

      <Container variant="viewport">
        <Container variant="content">
          <div>Login</div>
        </Container>
      </Container>
    </div>
  );
}

export default Login;