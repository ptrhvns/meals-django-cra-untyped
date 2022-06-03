import useOutsideClick from "./useOutsideClick";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { useState } from "react";

function TestComponent({ callback }) {
  const ref = useOutsideClick(callback);

  return (
    <>
      <div data-testid="outside">Outside</div>
      <div ref={ref}>Inside</div>
    </>
  );
}

function buildComponent({ callback }) {
  return <TestComponent callback={callback} />;
}

it("calls callback prop when user clicks outside of element using ref", async () => {
  const user = userEvent.setup();
  const callback = jest.fn();
  render(buildComponent({ callback }));
  await user.click(screen.getByTestId("outside"));
  expect(callback).toHaveBeenCalled();
});
