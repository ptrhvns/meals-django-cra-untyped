import Container from "../components/Container";
import Navbar from "../components/Navbar";
import RecipeCreateForm from "../components/RecipeCreateForm";
import { buildTitle } from "../lib/utils";
import { Helmet } from "react-helmet-async";

function RecipeCreate() {
  return (
    <div className="recipe-create">
      <Helmet>
        <title>{buildTitle("Create Recipe")}</title>
      </Helmet>

      <Navbar />

      <Container className="recipe-create-viewport" variant="viewport">
        <Container className="recipe-create-content" variant="content">
          <div className="recipe-create-card">
            <h1>Create Recipe</h1>

            <p className="recipe-create-instructions">
              Start with the recipe title.
            </p>

            <RecipeCreateForm />
          </div>
        </Container>
      </Container>
    </div>
  );
}

export default RecipeCreate;
