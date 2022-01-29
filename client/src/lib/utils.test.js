import { buildTitle } from './utils';

describe("buildTitle()", () => {
  describe("when subtitle is given", () => {
    it("returns a title including subtitle", () => {
      const subtitle = "Test Subtitle";
      expect(buildTitle(subtitle)).toMatch(subtitle);
    });
  });

  describe("when subtitle is not given", () => {
    it("returns a default title", () => {
      expect(buildTitle().length).toBeGreaterThan(0);
    });
  });
});
