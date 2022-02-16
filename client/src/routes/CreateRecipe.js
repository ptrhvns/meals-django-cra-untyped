import Container from "../components/Container";
import CreateRecipeForm from "../components/CreateRecipeForm";
import Navbar from "../components/Navbar";
import { buildTitle } from "../lib/utils";
import { Helmet } from "react-helmet-async";

function CreateRecipe() {
  return (
    <div className="create-recipe">
      <Helmet>
        <title>{buildTitle("Create Recipe")}</title>
      </Helmet>

      <Navbar />

      <Container className="create-recipe-viewport" variant="viewport">
        <Container className="create-recipe-content" variant="content">
          <div className="create-recipe-card">
            <h1>Create Recipe</h1>

            <p className="create-recipe-instructions">
              Start with the recipe title.
            </p>

            <CreateRecipeForm />
          </div>
        </Container>
      </Container>
    </div>
  );
}

export default CreateRecipe;
