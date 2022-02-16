import Container from "../components/Container";
import Navbar from "../components/Navbar";
import { buildTitle } from "../lib/utils";
import { Helmet } from "react-helmet-async";

function Recipe() {
  return (
    <div className="recipe">
      <Helmet>
        {/* TODO make page title reflect recipe title */}
        <title>{buildTitle("Recipe")}</title>
      </Helmet>

      <Navbar />

      <Container variant="viewport">
        <Container variant="content">
          <div>Recipe</div>
        </Container>
      </Container>
    </div>
  );
}

export default Recipe;
