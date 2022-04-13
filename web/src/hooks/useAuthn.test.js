import AuthnProvider from "../providers/AuthnProvider";
import useAuthn from "./useAuthn";
import { has } from "lodash";
import { render } from "@testing-library/react";

function FakeComponent() {
  const authn = useAuthn();

  return <>{has(authn, "isAuthenticated") && <>authn has isAuthenticated</>}</>;
}

function buildFakeComponent() {
  return (
    <AuthnProvider>
      <FakeComponent />
    </AuthnProvider>
  );
}

it("returns current context value for AuthnContext", () => {
  const { queryByText } = render(buildFakeComponent());
  expect(queryByText("authn has isAuthenticated")).toBeTruthy();
});
