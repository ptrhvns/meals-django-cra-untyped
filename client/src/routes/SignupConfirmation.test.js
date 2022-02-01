jest.mock("../lib/api", () => ({ post: jest.fn() }));

import ReactDOM from "react-dom";
import SignupConfirmation from "./SignupConfirmation";
import { act, render, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { post } from "../lib/api";
import { routes } from "../lib/api";

function buildComponent() {
  return (
    <MemoryRouter>
      <HelmetProvider>
        <SignupConfirmation />
      </HelmetProvider>
    </MemoryRouter>
  );
}

it("renders successfully", () => {
  const div = document.createElement("div");
  ReactDOM.render(buildComponent(), div);
});

it("renders the correct <title>", async () => {
  post.mockResolvedValue({ message: "test message" });

  act(() => {
    render(buildComponent());
  });

  await waitFor(() => expect(document.title).toContain("Signup Confirmation"));
});

describe("while sign up confirmation is pending", () => {
  it("renders a pending message", async () => {
    post.mockReturnValue(new Promise(() => {}));

    act(() => {
      const { queryByText } = render(buildComponent());
      expect(queryByText("Confirming your signup...")).toBeTruthy();
    });
  });
});

describe("when sign up confirmation fails", () => {
  it("renders an error message", async () => {
    const message = "test error";
    post.mockResolvedValue({ isError: true, message });
    let queryByTestId, queryByText;

    await act(async () => {
      const container = render(buildComponent());
      queryByTestId = container.queryByTestId;
      queryByText = container.queryByText;
    });

    expect(queryByTestId("signup-confirmation-message-error")).toBeTruthy();
    expect(queryByText(message)).toBeTruthy();
  });
});

describe("when sign up confirmation is successful", () => {
  it("renders a success message", async () => {
    const message = "test success";
    post.mockResolvedValue({ message });
    let queryByTestId, queryByText;

    await act(async () => {
      const container = render(buildComponent());
      queryByTestId = container.queryByTestId;
      queryByText = container.queryByText;
    });

    expect(queryByTestId("signup-confirmation-message-success")).toBeTruthy();
    expect(queryByText(message)).toBeTruthy();
  });
});
