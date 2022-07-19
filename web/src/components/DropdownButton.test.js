import DropdownButton from "./DropdownButton";
import userEvent from "@testing-library/user-event";
import { act, render, screen } from "@testing-library/react";
import { createRoot } from "react-dom/client";
import { merge } from "lodash";

function buildComponent(props = {}) {
  props = merge(
    {
      buttonText: "Test save",
      menuItems: [
        {
          handleClick: jest.fn(),
          text: "Test menu item",
        },
      ],
      spin: false,
    },
    props
  );

  return <DropdownButton {...props} />;
}

it("renders successfully", () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  act(() => root.render(buildComponent()));
});

describe("when user clicks on button twice", () => {
  it("opens and then closes menu", async () => {
    const user = userEvent.setup();
    render(buildComponent());
    await user.click(screen.getByTestId("dropdown-button__button")); // open
    expect(
      screen.queryByTestId("dropdown-button__button-menu-wrapper")
    ).toBeTruthy();
    await user.click(screen.getByTestId("dropdown-button__button")); // close
    expect(
      screen.queryByTestId("dropdown-button__button-menu-wrapper")
    ).not.toBeTruthy();
  });
});

describe("when menu is open", () => {
  describe("when user clicks on menu item", () => {
    it("closes menu", async () => {
      const user = userEvent.setup();
      const menuItem = { handleClick: jest.fn(), text: "click me" };
      render(buildComponent({ menuItems: [menuItem] }));
      await user.click(screen.getByTestId("dropdown-button__button"));
      await user.click(screen.getByText(menuItem.text));
      expect(
        screen.queryByTestId("dropdown-button__button-menu-wrapper")
      ).not.toBeTruthy();
    });
  });

  describe("when user clicks outside of button and menu", () => {
    it("closes menu", async () => {
      function TestComponent() {
        return (
          <>
            <div data-testid="outside">Outside</div>
            <DropdownButton
              buttonText="Button click me"
              menuItems={[
                { handleClick: jest.fn(), text: "Menu item click me" },
              ]}
              spin={false}
            />
          </>
        );
      }

      const user = userEvent.setup();
      render(<TestComponent />);
      await user.click(screen.getByTestId("dropdown-button__button"));
      await user.click(screen.getByTestId("outside"));
      expect(
        screen.queryByTestId("dropdown-button__button-menu-wrapper")
      ).not.toBeTruthy();
    });
  });
});

describe("when buttonClassName prop is given", () => {
  it("renders that class on the button", () => {
    const buttonClassName = "test-class";
    render(buildComponent({ buttonClassName }));
    const button = screen.getByTestId("dropdown-button__button");
    expect(button.className).toContain(buttonClassName);
  });
});

describe("when menuClassName prop is given", () => {
  it("renders that class on the menu", async () => {
    const user = userEvent.setup();
    const menuClassName = "test-class";
    render(buildComponent({ menuClassName }));
    await user.click(screen.getByTestId("dropdown-button__button"));
    const div = screen.getByTestId("dropdown-button__button-menu-wrapper");
    expect(div.className).toContain(menuClassName);
  });
});

describe("when menuItemClassName is given", () => {
  it("renders that class on the menu items", async () => {
    const user = userEvent.setup();
    const menuItemClassName = "test-class";
    const text = "Click me";
    render(
      buildComponent({
        menuItemClassName,
        menuItems: [{ handleClick: jest.fn(), text }],
      })
    );
    await user.click(screen.getByTestId("dropdown-button__button"));
    const li = screen.getByText(text);
    expect(li.className).toContain(menuItemClassName);
  });
});

it("renders buttonText prop", () => {
  const buttonText = "Click me";
  render(buildComponent({ buttonText }));
  expect(screen.queryByText(buttonText)).toBeTruthy();
});

describe("when user clicks button", () => {
  it("renders contents of menuItems prop", async () => {
    const user = userEvent.setup();
    const text = "Click me";
    render(buildComponent({ menuItems: [{ handleClick: jest.fn(), text }] }));
    await user.click(screen.getByTestId("dropdown-button__button"));
    expect(screen.getByText(text)).toBeTruthy();
  });
});
