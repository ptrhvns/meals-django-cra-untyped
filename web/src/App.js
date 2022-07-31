import Dashboard from "./routes/Dashboard";
import Home from "./routes/Home";
import Login from "./routes/Login";
import NotFound from "./routes/NotFound";
import PrivacyPolicy from "./routes/PrivacyPolicy";
import Recipe from "./routes/Recipe";
import RecipeEquipmentCreateForm from "./routes/RecipeEquipmentCreateForm";
import RecipeEquipmentEditForm from "./routes/RecipeEquipmentEditForm";
import RecipeIngredientCreateForm from "./routes/RecipeIngredientCreateForm";
import RecipeIngredientEditForm from "./routes/RecipeIngredientEditForm";
import RecipeNew from "./routes/RecipeNew";
import RecipeNotesEditor from "./routes/RecipeNotesEditor";
import RecipeRatingEditor from "./routes/RecipeRatingEditor";
import RecipeServingsEditor from "./routes/RecipeServingsEditor";
import RecipeTagCreateForm from "./routes/RecipeTagCreateForm";
import RecipeTagEditForm from "./routes/RecipeTagEditForm";
import RecipeTimeForm from "./routes/RecipeTimeForm";
import RecipeTitleForm from "./routes/RecipeTitleForm";
import RequireAuthn from "./components/RequireAuthn";
import RequireGuest from "./components/RequireGuest";
import Settings from "./routes/Settings";
import Signup from "./routes/Signup";
import SignupConfirmation from "./routes/SignupConfirmation";
import TermsAndConditions from "./routes/TermsAndConditions";
import { Helmet } from "react-helmet-async";
import { Routes, Route } from "react-router-dom";
import { StrictMode } from "react";

import "./App.scss";

function App() {
  // istanbul ignore next
  return (
    <StrictMode>
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
          path="/recipe/:recipeId/equipment/new"
          element={
            <RequireAuthn>
              <RecipeEquipmentCreateForm />
            </RequireAuthn>
          }
        />
        <Route
          path="/recipe/:recipeId/equipment/:equipmentId/edit"
          element={
            <RequireAuthn>
              <RecipeEquipmentEditForm />
            </RequireAuthn>
          }
        />
        <Route
          path="/recipe/:recipeId/ingredients/new"
          element={
            <RequireAuthn>
              <RecipeIngredientCreateForm />
            </RequireAuthn>
          }
        />
        <Route
          path="/recipe/:recipeId/ingredient/:ingredientId/edit"
          element={
            <RequireAuthn>
              <RecipeIngredientEditForm />
            </RequireAuthn>
          }
        />
        <Route
          path="/recipe/:recipeId/notes/edit"
          element={
            <RequireAuthn>
              <RecipeNotesEditor />
            </RequireAuthn>
          }
        />
        <Route
          path="/recipe/:recipeId/rating/edit"
          element={
            <RequireAuthn>
              <RecipeRatingEditor />
            </RequireAuthn>
          }
        />
        <Route
          path="/recipe/:recipeId/servings/edit"
          element={
            <RequireAuthn>
              <RecipeServingsEditor />
            </RequireAuthn>
          }
        />
        <Route
          path="/recipe/:recipeId/tag/new"
          element={
            <RequireAuthn>
              <RecipeTagCreateForm />
            </RequireAuthn>
          }
        />
        <Route
          path="/recipe/:recipeId/tag/:tagId/edit"
          element={
            <RequireAuthn>
              <RecipeTagEditForm />
            </RequireAuthn>
          }
        />
        <Route
          path="/recipe/:recipeId/time/new"
          element={
            <RequireAuthn>
              <RecipeTimeForm />
            </RequireAuthn>
          }
        />
        <Route
          path="/recipe/:recipeId/time/:timeId/edit"
          element={
            <RequireAuthn>
              <RecipeTimeForm />
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
    </StrictMode>
  );
}

export default App;
