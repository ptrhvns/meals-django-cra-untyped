jest.mock("../hooks/useApi", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("../hooks/useAuthn", () => ({
  __esModule: true,
  default: jest.fn(),
}));

import ReactDOM from "react-dom";
import Signup from "./Signup";
import useApi from "../hooks/useApi";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { render, waitFor } from "@testing-library/react";

function buildComponent() {
  return (
    <MemoryRouter>
      <HelmetProvider>
        <Signup />
      </HelmetProvider>
    </MemoryRouter>
  );
}

const post = jest.fn();

beforeEach(() => {
  post.mockResolvedValue({});
  useApi.mockReturnValue({ post });
});

it("renders successfully", () => {
  const div = document.createElement("div");
  ReactDOM.render(buildComponent(), div);
});

it("renders the correct <title>", async () => {
  const component = render(buildComponent());
  await waitFor(() => expect(document.title).toContain("Create Account"));
});
