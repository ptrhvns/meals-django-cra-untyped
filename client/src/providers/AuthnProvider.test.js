import AuthnProvider from "./AuthnProvider";
import useAuthn from "../hooks/useAuthn";
import userEvent from "@testing-library/user-event";
import { act, render } from "@testing-library/react";

function buildComponent(Component) {
  return (
    <AuthnProvider>
      <Component />
    </AuthnProvider>
  );
}

afterEach(() => {
  localStorage.removeItem("isAuthenticated");
});

describe("when isAuthenticated is set in localStorage", () => {
  it("sets isAuthenticated context value to true", () => {
    function FakeComponent() {
      const authn = useAuthn();
      return <>{authn.isAuthenticated && <>isAuthenticated is true</>}</>;
    }

    localStorage.setItem("isAuthenticated", "true");
    const { queryByText } = render(buildComponent(FakeComponent));
    expect(queryByText("isAuthenticated is true")).toBeTruthy();
  });
});

describe("when isAuthenticated is not set in localStorage", () => {
  it("sets isAuthenticated context value to false", () => {
    function FakeComponent() {
      const authn = useAuthn();
      return <>{authn.isAuthenticated || <>isAuthenticated is false</>}</>;
    }

    const { queryByText } = render(buildComponent(FakeComponent));
    expect(queryByText("isAuthenticated is false")).toBeTruthy();
  });
});

describe("login()", () => {
  it("sets isAuthenticated in localStorage to true", async () => {
    function FakeComponent() {
      const authn = useAuthn();

      return (
        <button onClick={() => authn.login()} type="button">
          test button
        </button>
      );
    }

    const user = userEvent.setup();
    const { getByRole } = render(buildComponent(FakeComponent));

    await user.click(
      getByRole("button", { hidden: true, name: "test button" })
    );

    expect(localStorage.getItem("isAuthenticated")).toBeTruthy();
  });

  it("sets isAuthenticated context value to true", async () => {
    function FakeComponent() {
      const authn = useAuthn();

      return (
        <>
          {authn.isAuthenticated && <>isAuthenticated is true</>}

          <button onClick={() => authn.login()} type="button">
            test button
          </button>
        </>
      );
    }

    const user = userEvent.setup();
    const { getByRole, queryByText } = render(buildComponent(FakeComponent));

    await user.click(
      getByRole("button", { hidden: true, name: "test button" })
    );

    expect(queryByText("isAuthenticated is true")).toBeTruthy();
  });

  it("calls given callback", async () => {
    const callback = jest.fn();

    function FakeComponent() {
      const authn = useAuthn();

      return (
        <>
          <button onClick={() => authn.login(callback)} type="button">
            test button
          </button>
        </>
      );
    }

    const user = userEvent.setup();
    const { getByRole } = render(buildComponent(FakeComponent));

    await user.click(
      getByRole("button", { hidden: true, name: "test button" })
    );

    expect(callback).toHaveBeenCalled();
  });
});

describe("logout()", () => {
  it("removes isAuthenticated from localStorage", async () => {
    function FakeComponent() {
      const authn = useAuthn();

      return (
        <button onClick={() => authn.logout()} type="button">
          test button
        </button>
      );
    }

    const user = userEvent.setup();
    const { getByRole } = render(buildComponent(FakeComponent));

    await user.click(
      getByRole("button", { hidden: true, name: "test button" })
    );

    expect(localStorage.getItem("isAuthenticated")).not.toBeTruthy();
  });

  it("sets isAuthenticated context value to false", async () => {
    function FakeComponent() {
      const authn = useAuthn();

      return (
        <>
          {authn.isAuthenticated || <>isAuthenticated is false</>}

          <button
            onClick={() => {
              authn.login();
              authn.logout();
            }}
            type="button"
          >
            test button
          </button>
        </>
      );
    }

    const user = userEvent.setup();
    const { getByRole, queryByText } = render(buildComponent(FakeComponent));

    await user.click(
      getByRole("button", { hidden: true, name: "test button" })
    );

    expect(queryByText("isAuthenticated is false")).toBeTruthy();
  });

  it("calls given callback", async () => {
    const callback = jest.fn();

    function FakeComponent() {
      const authn = useAuthn();

      return (
        <>
          <button onClick={() => authn.logout(callback)} type="button">
            test button
          </button>
        </>
      );
    }

    const user = userEvent.setup();
    const { getByRole } = render(buildComponent(FakeComponent));

    await user.click(
      getByRole("button", { hidden: true, name: "test button" })
    );

    expect(callback).toHaveBeenCalled();
  });
});

it("renders given children", () => {
  function FakeComponent() {
    return <div>test children</div>;
  }

  const { queryByText } = render(buildComponent(FakeComponent));
  expect(queryByText("test children")).toBeTruthy();
});
