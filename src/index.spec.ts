import { test, expect } from '@playwright/test';
import { XTestSuite } from "x-feature-reporter";
import { XChangeType, XFeatureDiff, XTestSuiteDiff } from '.';
import sinon from 'sinon';
import fs from 'fs';

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



test.describe("Markdown", () => {
  let writeFileSyncStub: sinon.SinonStub;
  test.beforeEach(() => {
    writeFileSyncStub = sinon.stub(fs, 'writeFileSync');
    writeFileSyncStub.returns(undefined);
  });
  test.afterEach(() => {
    sinon.restore(); 
  });
  test("Indicates in markdown that a suite title has changed", () => {
    const differ = new XFeatureDiff();
    const title = "Suite 1";
    const report1 = {
      title: title,
      suites: [],
      tests: []
    } as XTestSuite;
    const report2 = {
      title: "Suite 2",
      suites: [],
      tests: []
    } as XTestSuite;
    const diffJson = differ.diff(report1, report2) as XTestSuiteDiff;
    differ.generateMarkdown(diffJson);
    const expected = `\n## 🔄 ${title}\n - ✅ Test 1\n`
    const actual = writeFileSyncStub.getCall(0)?.args[1];
    expect(actual).toBe(expected);
  });
});
