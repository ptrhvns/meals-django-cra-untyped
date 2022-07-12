jest.mock("../hooks/useApi", () => ({
  __esModule: true,
  default: jest.fn(),
}));

import SignupConfirmation from "./SignupConfirmation";
import useApi from "../hooks/useApi";
import { act, render, screen, waitFor } from "@testing-library/react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";

function buildComponent() {
  return (
    <MemoryRouter>
      <HelmetProvider>
        <SignupConfirmation />
      </HelmetProvider>
    </MemoryRouter>
  );
}

const post = jest.fn();

beforeEach(() => {
  post.mockResolvedValue({});
  useApi.mockReturnValue({ post });
});

it("renders successfully", async () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  await act(async () => root.render(buildComponent()));
});

it("renders the correct <title>", async () => {
  post.mockResolvedValue({ message: "test message" });
  await act(() => render(buildComponent()));
  await waitFor(() => expect(document.title).toContain("Signup Confirmation"));
});

describe("while sign up confirmation is pending", () => {
  it("renders a pending message", async () => {
    post.mockReturnValue(new Promise(() => {}));
    await act(() => render(buildComponent()));
    expect(screen.queryByText("Confirming your signup...")).toBeTruthy();
  });
});

describe("when sign up confirmation fails", () => {
  it("renders an error message", async () => {
    const message = "test error";
    post.mockResolvedValue({ isError: true, message });
    await act(() => render(buildComponent()));
    await waitFor(() =>
      expect(
        screen.queryByTestId("signup-confirmation-message-error")
      ).toBeTruthy()
    );
    expect(screen.queryByText(message)).toBeTruthy();
  });
});

describe("when sign up confirmation is successful", () => {
  it("renders a success message", async () => {
    const message = "test success";
    post.mockResolvedValue({ message });
    await act(() => render(buildComponent()));
    await waitFor(() =>
      expect(
        screen.queryByTestId("signup-confirmation-message-success")
      ).toBeTruthy()
    );
    expect(screen.queryByText(message)).toBeTruthy();
  });
});
