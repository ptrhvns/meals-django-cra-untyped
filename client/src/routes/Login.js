import FullPageCard from "../components/FullPageCard";
import LoginForm from "../components/LoginForm";
import { buildTitle } from "../lib/utils";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

function Login() {
  return (
    <div className="login">
      <Helmet>
        <title>{buildTitle("Login")}</title>
      </Helmet>

      <FullPageCard>
        <h1 className="login-header">Login</h1>

        <LoginForm />

        <p className="login-signup-link">
          Don't have an account? <Link to="/signup">Sign up</Link>.
        </p>
      </FullPageCard>
    </div>
  );
}

export default Login;
