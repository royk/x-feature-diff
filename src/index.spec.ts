import { test, expect } from '@playwright/test';
import { XTestSuite } from "x-feature-reporter";
import { XChangeType, XFeatureDiff, XTestSuiteDiff } from '.';

test.describe("Core features", () => { 
  test("Identifies that a suite title has changed", () => {
    const diff = new XFeatureDiff();
    const report1 = {
      title: "Suite 1",
      suites: [],
      tests: []
    } as XTestSuite;
    const report2 = {
      title: "Suite 2",
      suites: [],
      tests: []
    } as XTestSuite;
    const result = diff.diff(report1, report2) as XTestSuiteDiff;

    expect(result.title).toBe("Suite 1");
    expect(result.changes).toBe(XChangeType.Modified);
  });
});
