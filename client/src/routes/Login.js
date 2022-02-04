import FullPageCard from "../components/FullPageCard";
import LoginForm from "../components/LoginForm";
import { buildTitle } from "../lib/utils";
import { Helmet } from "react-helmet-async";

function Login() {
  return (
    <div className="login">
      <Helmet>
        <title>{buildTitle("Login")}</title>
      </Helmet>

      <FullPageCard>
        <h1 className="login-header">Login</h1>
        <LoginForm />
      </FullPageCard>
    </div>
  );
}

export default Login;
