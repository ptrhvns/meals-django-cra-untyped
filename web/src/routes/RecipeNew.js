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

      <Container className="recipe-new__viewport" variant="viewport">
        <Container className="recipe-new__content" variant="content">
          <div className="recipe-new__card">
            <h1>New Recipe</h1>

            <p className="recipe-new__instructions">
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
