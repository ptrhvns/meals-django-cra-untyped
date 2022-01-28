import SignupFormConfirmation from "./SignupFormConfirmation";
import ReactDOM from "react-dom";

function buildComponent() {
  return <SignupFormConfirmation />;
}

it("renders successfully", () => {
  const div = document.createElement("div");
  ReactDOM.render(buildComponent(), div);
});
