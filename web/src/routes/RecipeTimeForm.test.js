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
import ReactDOM from "react-dom";
import RecipeTimeForm from "./RecipeTimeForm";
import useApi from "../hooks/useApi";
import userEvent from "@testing-library/user-event";
import { act, render, screen, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { keys, head, merge } from "lodash";
import { MemoryRouter, useNavigate, useParams } from "react-router-dom";
import { within } from "@testing-library/dom";

function buildComponent(props = {}) {
  return (
    <HelmetProvider>
      <MemoryRouter>
        <AuthnProvider>
          <RecipeTimeForm {...props} />
        </AuthnProvider>
      </MemoryRouter>
    </HelmetProvider>
  );
}

const get = jest.fn();
const post = jest.fn();
let navigate;

beforeEach(() => {
  post.mockResolvedValue({});
  get.mockResolvedValue({ data: {} });
  useApi.mockReturnValue({ get, post });
  navigate = jest.fn();
  useNavigate.mockReturnValue(navigate);
  useParams.mockReturnValue({ recipeId: 1 });
});

it("renders successfully", () => {
  const div = document.createElement("div");
  ReactDOM.render(buildComponent(), div);
});

describe("when timeId param is not present", () => {
  it("renders the correct <title> for creating", async () => {
    useParams.mockReturnValue({ recipeId: 7 });
    render(buildComponent());
    await waitFor(() => expect(document.title).toContain("New Recipe Time"));
  });

  it("renders the correct <h1> for creating", async () => {
    useParams.mockReturnValue({ recipeId: 7 });
    render(buildComponent());
    expect(screen.queryByText("New Recipe Time")).toBeTruthy();
  });
});

describe("when timeId param is present", () => {
  it("renders the correct <title> for editing", async () => {
    useParams.mockReturnValue({ recipeId: 7, timeId: 8 });
    render(buildComponent());
    await waitFor(() => expect(document.title).toContain("Edit Recipe Time"));
  });

  it("renders the correct <h1> for editing", async () => {
    useParams.mockReturnValue({ recipeId: 7, timeId: 8 });
    await act(async () => render(buildComponent()));
    expect(screen.queryByText("Edit Recipe Time")).toBeTruthy();
  });
});

async function submitForm(user, data = {}) {
  data = merge(
    {
      days: "5",
      hours: "6",
      minutes: "7",
      note: "Test note",
      time_type: "Cook",
    },
    data
  );

  await user.selectOptions(screen.getByLabelText("Type"), data.time_type);
  await user.type(screen.getByLabelText("Days"), data["days"]);
  await user.type(screen.getByLabelText("Hours"), data["hours"]);
  await user.type(screen.getByLabelText("Minutes"), data["minutes"]);
  await user.type(screen.getByLabelText("Note (optional)"), data["note"]);

  await user.click(screen.getByRole("button", { name: "Save" }));

  return data;
}

describe("when form has been submitted", () => {
  describe("when timeId param is not present", () => {
    it("requests time creation from API", async () => {
      const user = userEvent.setup();
      const recipeId = 7;
      useParams.mockReturnValue({ recipeId });
      post.mockResolvedValue({});
      render(buildComponent());
      const data = await submitForm(user);
      expect(post).toHaveBeenCalledWith({
        data,
        route: "recipeTimeCreate",
        routeData: { recipeId, timeId: undefined },
      });
    });
  });

  describe("when timeId param is present", () => {
    it("requests time update from API", async () => {
      const user = userEvent.setup();
      const recipeId = 7;
      const timeId = 8;
      useParams.mockReturnValue({ recipeId, timeId });
      get.mockResolvedValue({ data: {} });
      post.mockResolvedValue({});
      render(buildComponent());
      await waitFor(() => screen.getByText("Edit Recipe Time"));
      const data = await submitForm(user);
      expect(post).toHaveBeenCalledWith({
        data,
        route: "recipeTimeUpdate",
        routeData: { recipeId, timeId },
      });
    });
  });

  describe("when API responds with general error", () => {
    it("renders dismissable alert with general error", async () => {
      const user = userEvent.setup();
      useParams.mockReturnValue({ recipeId: 7, timeId: 8 });
      get.mockResolvedValue({ data: {} });
      const message = "Test error.";
      post.mockResolvedValue({ isError: true, message });
      render(buildComponent());
      await waitFor(() => screen.getByText("Edit Recipe Time"));
      await submitForm(user);
      expect(screen.queryByText(message)).toBeTruthy();
      const alert = screen.getByTestId("alert");
      await user.click(within(alert).getByRole("button", { name: "Dismiss" }));
      expect(screen.queryByText(message)).not.toBeTruthy();
    });
  });

  describe("when API responds with field errors", () => {
    it("renders field errors", async () => {
      const user = userEvent.setup();
      useParams.mockReturnValue({ recipeId: 7 });
      const errors = {
        days: ["Test days error."],
        hours: ["Test hours error."],
        minutes: ["Test minutes error."],
        note: ["Test note error."],
        time_type: ["Test time type error."],
      };
      post.mockResolvedValue({ errors, isError: true, message: "Test error." });
      render(buildComponent());
      await submitForm(user);
      await waitFor(() => {
        keys(errors).forEach((key) => {
          expect(screen.queryByText(head(errors[key]))).toBeTruthy();
        });
      });
    });
  });

  describe("when API responds with success", () => {
    it("navigates user to recipe", async () => {
      const user = userEvent.setup();
      const recipeId = 7;
      useParams.mockReturnValue({ recipeId });
      post.mockResolvedValue({});
      render(buildComponent());
      await submitForm(user);
      expect(navigate).toHaveBeenCalledWith(`/recipe/${recipeId}`);
    });
  });
});

describe("when time has been deleted", () => {
  describe("when user confirms deletion", () => {
    it("requests time destruction from API", async () => {
      const timeId = 8;
      useParams.mockReturnValue({ recipeId: 7, timeId });
      const user = userEvent.setup();
      window.confirm = jest.fn(() => true);
      post.mockResolvedValue({});
      render(buildComponent());
      await waitFor(() => screen.getByText("Edit Recipe Time"));
      await user.click(screen.getByRole("button", { name: "Delete" }));
      expect(post).toHaveBeenCalledWith({
        route: "recipeTimeDestroy",
        routeData: { timeId },
      });
    });

    describe("when API responds with error", () => {
      it("renders dismissable alert with error", async () => {
        const user = userEvent.setup();
        window.confirm = jest.fn(() => true);
        useParams.mockReturnValue({ recipeId: 7, timeId: 8 });
        get.mockResolvedValue({ data: {} });
        const message = "Test error.";
        post.mockResolvedValue({ isError: true, message });
        render(buildComponent());
        await waitFor(() => screen.getByText("Edit Recipe Time"));
        await user.click(screen.getByRole("button", { name: "Delete" }));
        expect(screen.queryByText(message)).toBeTruthy();
        const alert = screen.getByTestId("alert");
        await user.click(
          within(alert).getByRole("button", { name: "Dismiss" })
        );
        expect(screen.queryByText(message)).not.toBeTruthy();
      });
    });

    describe("when API responds with success", () => {
      it("navigates user to recipe", async () => {
        const user = userEvent.setup();
        const recipeId = 7;
        useParams.mockReturnValue({ recipeId, timeId: 8 });
        window.confirm = jest.fn(() => true);
        render(buildComponent());
        await waitFor(() => screen.getByText("Edit Recipe Time"));
        await user.click(screen.getByRole("button", { name: "Delete" }));
        expect(navigate).toHaveBeenCalledWith(`/recipe/${recipeId}`);
      });
    });
  });

  describe("when user does not confirm deletion", () => {
    it("does not request time destruction from API", async () => {
      const user = userEvent.setup();
      window.confirm = jest.fn(() => false);
      useParams.mockReturnValue({ recipeId: 7, timeId: 8 });
      render(buildComponent());
      await waitFor(() => screen.getByText("Edit Recipe Time"));
      await user.click(screen.getByRole("button", { name: "Delete" }));
      expect(post).not.toHaveBeenCalled();
    });
  });
});
