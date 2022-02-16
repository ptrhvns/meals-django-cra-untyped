import * as utils from "./utils";

describe("buildTitle()", () => {
  describe("when subtitle is given", () => {
    it("returns a title including subtitle", () => {
      const subtitle = "Test Subtitle";
      expect(utils.buildTitle(subtitle)).toMatch(subtitle);
    });
  });

  describe("when subtitle is not given", () => {
    it("returns a default title", () => {
      expect(utils.buildTitle().length).toBeGreaterThan(0);
    });
  });
});

describe("handleResponseErrors()", () => {
  describe("when nothing is given", () => {
    it("does not throw an error", () => {
      expect(() => utils.handleResponseErrors()).not.toThrow();
    });
  });

  describe("when setAlertMessage is given", () => {
    it("calls it with response.message", () => {
      const message = "test message";
      const setAlertMessage = jest.fn();
      const response = { message };
      utils.handleResponseErrors({ response, setAlertMessage });
      expect(setAlertMessage).toHaveBeenCalledWith(response.message);
    });
  });

  describe("when setError is given", () => {
    it("calls it for first error in each response.error", () => {
      const error1 = "test error1";
      const error2 = "test error2";
      const response = { errors: { field1: [error1], field2: [error2] } };
      const setError = jest.fn();
      utils.handleResponseErrors({ response, setError });
      expect(setError).toHaveBeenCalledWith("field1", {
        message: error1,
        type: "manual",
      });
      expect(setError).toHaveBeenCalledWith("field2", {
        message: error2,
        type: "manual",
      });
    });
  });
});
