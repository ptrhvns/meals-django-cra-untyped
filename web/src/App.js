import Dashboard from "./routes/Dashboard";
import Home from "./routes/Home";
import Login from "./routes/Login";
import NotFound from "./routes/NotFound";
import PrivacyPolicy from "./routes/PrivacyPolicy";
import Recipe from "./routes/Recipe";
import RecipeNew from "./routes/RecipeNew";
import RecipeTagForm from "./routes/RecipeTagForm";
import RecipeTitleForm from "./routes/RecipeTitleForm";
import RequireAuthn from "./components/RequireAuthn";
import RequireGuest from "./components/RequireGuest";
import Settings from "./routes/Settings";
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
        <Route
          path="/"
          element={
            <RequireGuest>
              <Home />
            </RequireGuest>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuthn>
              <Dashboard />
            </RequireAuthn>
          }
        />
        <Route
          path="/login"
          element={
            <RequireGuest>
              <Login />
            </RequireGuest>
          }
        />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route
          path="/recipe/:recipeId"
          element={
            <RequireAuthn>
              <Recipe />
            </RequireAuthn>
          }
        />
        <Route
          path="/recipe/:recipeId/tag/new"
          element={
            <RequireAuthn>
              <RecipeTagForm />
            </RequireAuthn>
          }
        />
        <Route
          path="/recipe/:recipeId/tag/:tagId/edit"
          element={
            <RequireAuthn>
              <RecipeTagForm />
            </RequireAuthn>
          }
        />
        <Route
          path="/recipe/:recipeId/title/edit"
          element={
            <RequireAuthn>
              <RecipeTitleForm />
            </RequireAuthn>
          }
        />
        <Route
          path="/recipe/new"
          element={
            <RequireAuthn>
              <RecipeNew />
            </RequireAuthn>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuthn>
              <Settings />
            </RequireAuthn>
          }
        />
        <Route
          path="/signup"
          element={
            <RequireGuest>
              <Signup />
            </RequireGuest>
          }
        />
        <Route
          path="/signup-confirmation/:token"
          element={
            <RequireGuest>
              <SignupConfirmation />
            </RequireGuest>
          }
        />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
