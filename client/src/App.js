import Dashboard from "./routes/Dashboard";
import Home from "./routes/Home";
import Login from "./routes/Login";
import NotFound from "./routes/NotFound";
import PrivacyPolicy from "./routes/PrivacyPolicy";
import Signup from "./routes/Signup";
import SignupConfirmation from "./routes/SignupConfirmation";
import TermsAndConditions from "./routes/TermsAndConditions";
import { Helmet } from "react-helmet-async";
import { Routes, Route } from "react-router-dom";

import "./App.scss";

function App() {
  return (
    <>
      <Helmet>
        <title>Meals</title>
      </Helmet>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/signup-confirmation/:token"
          element={<SignupConfirmation />}
        />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
