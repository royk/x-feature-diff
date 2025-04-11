import { expect, test } from "@playwright/test";
import { compare } from "./index";
import type { XTestSuite as XTestSuite } from 'x-feature-reporter';;
test.describe("x-feature-diff", () => {
  test("Detects suite added", async () => {
    const oldSuites = [];
    const newSuites = [{
        title: "New Suite",
        suites: [],
        tests: []
    } as XTestSuite];
    const result = compare(oldSuites, newSuites);
    expect(result.length).toBe(1);
    expect(result[0].change).toBe("added");
  });
  test("Detects suite removed", async () => {
    const oldSuites = [{
        title: "Old Suite",
        suites: [],
        tests: []
    } as XTestSuite];
    const newSuites = [];
    const result = compare(oldSuites, newSuites);
    expect(result.length).toBe(1);
    expect(result[0].change).toBe("removed");
  });
});