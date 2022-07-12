jest.mock("../hooks/useApi", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}));

import AuthnProvider from "../providers/AuthnProvider";
import RecipeTitleForm from "./RecipeTitleForm";
import useApi from "../hooks/useApi";
import userEvent from "@testing-library/user-event";
import { act, render, screen, waitFor } from "@testing-library/react";
import { createRoot } from "react-dom/client";
import { head } from "lodash";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter, useNavigate, useParams } from "react-router-dom";
import { within } from "@testing-library/dom";

function buildComponent(props = {}) {
  return (
    <MemoryRouter>
      <HelmetProvider>
        <AuthnProvider>
          <RecipeTitleForm {...props} />
        </AuthnProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

it("renders successfully", async () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  await act(async () => root.render(buildComponent()));
});

const get = jest.fn();
const post = jest.fn();
let navigate;

beforeEach(() => {
  get.mockResolvedValue({ data: { title: "Test Title" } });
  post.mockResolvedValue({});
  useApi.mockReturnValue({ get, post });
  navigate = jest.fn();
  useNavigate.mockReturnValue(navigate);
  useParams.mockReturnValue({ recipeId: 1 });
});

it("renders correct <title>", async () => {
  render(buildComponent());
  await waitFor(() => expect(document.title).toContain("Edit Recipe Title"));
});

it("renders loading message correctly throughout lifecycle", async () => {
  let resolve;
  get.mockReturnValue(new Promise((res, _) => (resolve = res)));
  render(buildComponent());
  expect(screen.getByText("Loading")).toBeTruthy();
  await act(async () => resolve({ data: { title: "Test Title" } }));
  expect(screen.queryByText("Loading")).not.toBeTruthy();
});

async function submitForm(user, { title = "Delicious Cookies" } = {}) {
  const input = screen.getByLabelText("Title");
  await user.clear(input);
  await user.type(input, title);
  await user.click(screen.getByRole("button", { name: "Save" }));
}

describe("when the form has been submitted", () => {
  describe("when the title is missing", () => {
    it("renders a field error", async () => {
      const user = userEvent.setup();
      render(buildComponent());
      await waitFor(() => screen.getByLabelText("Title"));
      const input = screen.getByLabelText("Title");
      await user.clear(input);
      await user.click(screen.getByRole("button", { name: "Save" }));
      await waitFor(() =>
        expect(screen.queryByText("Title is required.")).toBeTruthy()
      );
    });
  });

  it("submits form data to the API", async () => {
    const recipeId = 7;
    useParams.mockReturnValue({ recipeId });
    const title = "Test Title";
    get.mockResolvedValue({ data: { title } });
    const user = userEvent.setup();
    render(buildComponent());
    await waitFor(() => screen.getByLabelText("Title"));
    await submitForm(user, { title });
    expect(post).toHaveBeenCalledWith({
      data: { title },
      route: "recipeTitleUpdate",
      routeData: { recipeId },
    });
  });

  describe("when the API returns a general error", () => {
    it("renders that error as dismissable", async () => {
      const message = "An error occurred.";
      post.mockReturnValue(Promise.resolve({ isError: true, message }));
      const user = userEvent.setup();
      render(buildComponent());
      await waitFor(() => screen.getByLabelText("Title"));
      await submitForm(user);
      expect(screen.queryByText(message)).toBeTruthy();
      const alert = screen.getByTestId("alert");
      await user.click(within(alert).getByRole("button", { name: "Dismiss" }));
      expect(screen.queryByText(message)).not.toBeTruthy();
    });
  });

  describe("when the API returns a field error for title", () => {
    it("renders that field error", async () => {
      const errors = {
        title: ["Title is invalid."],
      };
      post.mockReturnValue(
        Promise.resolve({
          errors,
          isError: true,
          message: "An error occurred.",
        })
      );
      const user = userEvent.setup();
      render(buildComponent());
      await waitFor(() => screen.getByLabelText("Title"));
      await submitForm(user);
      expect(screen.queryByText(head(errors.title))).toBeTruthy();
    });
  });

  describe("when the API returns success", () => {
    it("navigates user to '/recipe/${recipeId}'", async () => {
      const recipeId = 7;
      useParams.mockReturnValue({ recipeId });
      post.mockResolvedValue({});
      const user = userEvent.setup();
      render(buildComponent());
      await waitFor(() => screen.getByLabelText("Title"));
      await submitForm(user);
      expect(navigate).toHaveBeenCalledWith(`/recipe/${recipeId}`);
    });
  });
});
