import Container from "../components/Container";
import Navbar from "../components/Navbar";
import RecipeForm from "../components/RecipeForm";
import { buildTitle } from "../lib/utils";
import { Helmet } from "react-helmet-async";

function RecipeNew() {
  return (
    <div className="recipe-new">
      <Helmet>
        <title>{buildTitle("New Recipe")}</title>
      </Helmet>

      <Navbar />

      <Container className="recipe-new-viewport" variant="viewport">
        <Container className="recipe-new-content" variant="content">
          <div className="recipe-new-card">
            <h1>New Recipe</h1>

            <p className="recipe-new-instructions">
              Start with the recipe title.
            </p>

            <RecipeForm />
          </div>
        </Container>
      </Container>
    </div>
  );
}

export default RecipeNew;
