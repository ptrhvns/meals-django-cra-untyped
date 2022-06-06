import AsyncAutocomplete from "./AsyncAutocomplete";
import ReactDOM from "react-dom";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";

function TestComponent(props = {}) {
  const { register, setValue } = useForm();
  props = { register, setValue, ...props };
  return <AsyncAutocomplete {...props} />;
}

function buildComponent(props = {}) {
  props = { getMatches: jest.fn(() => []), inputName: "test", ...props };
  return <TestComponent {...props} />;
}

async function fillInputAndTestForMatches(user, text) {
  await user.type(screen.getByRole("textbox"), text);
  await waitFor(() =>
    expect(screen.queryByTestId("async-autocomplete__matches")).toBeTruthy()
  );
}

async function changeActiveMatch(user, key, match) {
  await user.keyboard(key);
  await waitFor(() => {
    expect(screen.getByText(match).className).toContain(
      "async-autocomplete__match-active"
    );
  });
}

it("renders successfully", () => {
  const div = document.createElement("div");
  ReactDOM.render(buildComponent(), div);
});

it("calls register prop with registerOptions prop", () => {
  const inputName = "testName";
  const register = jest.fn(() => ({}));
  const registerOptions = { required: "Test message." };
  render(buildComponent({ inputName, register, registerOptions }));
  expect(register).toHaveBeenCalledWith(inputName, registerOptions);
});

it("renders inputClassName prop", () => {
  const inputClassName = "test-class";
  render(buildComponent({ inputClassName }));
  expect(screen.getByRole("textbox").className).toContain(inputClassName);
});

it("renders inputId prop", () => {
  const inputId = "test-id";
  render(buildComponent({ inputId }));
  expect(screen.getByRole("textbox").id).toEqual(inputId);
});

describe("when user inputs text that has search matches", () => {
  it("displays matches", async () => {
    const user = userEvent.setup();
    const getMatches = jest.fn((_, callback) => callback(["TestMatch"]));
    render(buildComponent({ getMatches }));
    await fillInputAndTestForMatches(user, "M");
  });

  it("renders matchesClassName prop", async () => {
    const user = userEvent.setup();
    const getMatches = jest.fn((_, callback) => callback(["TestMatch"]));
    const matchesClassName = "test-class";
    render(buildComponent({ getMatches, matchesClassName }));
    await fillInputAndTestForMatches(user, "M");
    expect(
      screen.getByTestId("async-autocomplete__matches").className
    ).toContain(matchesClassName);
  });

  describe("when user types 'Up Arrow' and 'Down Arrow'", () => {
    it("moves active match up and down one", async () => {
      const user = userEvent.setup();
      const matches = ["Match1", "Match2"];
      const getMatches = jest.fn((_, callback) => callback(matches));
      render(buildComponent({ getMatches }));
      await fillInputAndTestForMatches(user, "M");
      const input = screen.getByRole("textbox");
      input.focus();
      await changeActiveMatch(user, "{ArrowDown}", matches[0]);
      await changeActiveMatch(user, "{ArrowDown}", matches[1]);
      await changeActiveMatch(user, "{ArrowDown}", matches[0]); // wraps
      await changeActiveMatch(user, "{ArrowUp}", matches[1]); // wraps
      await changeActiveMatch(user, "{ArrowUp}", matches[0]);
      await changeActiveMatch(user, "{ArrowUp}", matches[1]);
    });
  });

  describe("when user types 'Enter'", () => {
    describe("when user has selected a match", () => {
      it("fills input with active match", async () => {
        const user = userEvent.setup();
        const match = "TestMatch";
        const getMatches = jest.fn((_, callback) => callback([match]));
        render(buildComponent({ getMatches }));
        await fillInputAndTestForMatches(user, "M");
        const input = screen.getByRole("textbox");
        input.focus();
        await changeActiveMatch(user, "{ArrowDown}", match);
        await user.keyboard("{Enter}");
        expect(input.value).toEqual(match);
      });
    });

    describe("when user has not selected a match", () => {
      it("will leave the input alone", async () => {
        const user = userEvent.setup();
        const getMatches = jest.fn((_, callback) => callback(["TestMatch"]));
        render(buildComponent({ getMatches }));
        const input = screen.getByRole("textbox");
        const originalValue = "Mat";
        await fillInputAndTestForMatches(user, originalValue);
        input.focus();
        await user.keyboard("{Enter}");
        expect(input.value).toEqual(originalValue);
      });
    });
  });

  describe("when user types 'Escape'", () => {
    it("hides displayed matches", async () => {
      const user = userEvent.setup();
      const getMatches = jest.fn((_, callback) => callback(["TestMatch"]));
      render(buildComponent({ getMatches }));
      await fillInputAndTestForMatches(user, "M");
      const input = screen.getByRole("textbox");
      input.focus();
      await user.keyboard("{Escape}");
      await waitFor(() =>
        expect(
          screen.queryByTestId("async-autocomplete__matches")
        ).not.toBeTruthy()
      );
    });
  });

  describe("when user types 'Tab'", () => {
    it("hides displayed matches", async () => {
      const user = userEvent.setup();
      const getMatches = jest.fn((_, callback) => callback(["TestMatch"]));
      render(buildComponent({ getMatches }));
      await fillInputAndTestForMatches(user, "M");
      const input = screen.getByRole("textbox");
      input.focus();
      await user.tab();
      await waitFor(() =>
        expect(
          screen.queryByTestId("async-autocomplete__matches")
        ).not.toBeTruthy()
      );
    });
  });

  describe("when user clears input", () => {
    it("hides displayed matches", async () => {
      const user = userEvent.setup();
      const getMatches = jest.fn((_, callback) => callback(["TestMatch"]));
      render(buildComponent({ getMatches }));
      await fillInputAndTestForMatches(user, "M");
      await user.clear(screen.getByRole("textbox"));
      await waitFor(() =>
        expect(
          screen.queryByTestId("async-autocomplete__matches")
        ).not.toBeTruthy()
      );
    });
  });

  describe("when user hovers over match", () => {
    it("sets that match active", async () => {
      const user = userEvent.setup();
      const match = "TestMatch";
      const getMatches = jest.fn((_, callback) => callback([match]));
      render(buildComponent({ getMatches }));
      await fillInputAndTestForMatches(user, "M");
      await user.hover(screen.getByText(match));
      await waitFor(() => {
        expect(screen.getByText(match).className).toContain(
          "async-autocomplete__match-active"
        );
      });
    });
  });

  describe("when user clicks a match", () => {
    it("fills input with clicked match", async () => {
      const user = userEvent.setup();
      const match = "TestMatch";
      const getMatches = jest.fn((_, callback) => callback([match]));
      render(buildComponent({ getMatches }));
      await fillInputAndTestForMatches(user, "M");
      await user.click(screen.getByText(match));
      expect(screen.getByRole("textbox").value).toEqual(match);
    });
  });
});
