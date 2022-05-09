import PageLayout from "../components/PageLayout";
import RecipeForm from "../components/RecipeForm";
import { buildTitle } from "../lib/utils";
import { Helmet } from "react-helmet-async";

function RecipeNew() {
  return (
    <div className="recipe-new">
      <Helmet>
        <title>{buildTitle("New Recipe")}</title>
      </Helmet>

      <PageLayout contentClassName="recipe-new__content">
        <h1>New Recipe</h1>

        <p className="recipe-new__instructions">
          Start with a recipe title.
        </p>

        <RecipeForm />
      </PageLayout>
    </div>
  );
}

export default RecipeNew;
