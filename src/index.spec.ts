import { test, expect } from '@playwright/test';
import type { XTestSuite, XTestResult } from "x-feature-reporter";
import type { XTestSuiteDiff, XTestTestDiff } from "./index";
let XFeatureDiff: any = null;
test.beforeAll(async () => {
  if (!process.env.CI) {
    const module = await import('x-feature-diff');
    XFeatureDiff = module.XFeatureDiff;
  } else {
    const module = await import('./index');
    XFeatureDiff = module.XFeatureDiff;
  }
});

import sinon from 'sinon';
import fs from 'fs';

test.describe("Diffing", () => { 
  test("Identifies that a suite title has changed", () => {
    const diff = new XFeatureDiff({});
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
    const result = diff.diff(report1, report2);
    
    expect(result.title).toBe("Suite 1");
    expect(result.changes).toBe("modified");
  });
  
  test("Identifies that a test was added", () => {
    const diff = new XFeatureDiff({});
    const reportNew = {
      title: "Suite 1",
      suites: [],
      tests: [{
        title: "Test 1",
        status: 'passed'
      }, {
        title: "Test 2",
        status: 'passed'
      }]
    } as XTestSuite;
    const reportOld = {
      title: "Suite 1",
      suites: [],
      tests: [{
        title: "Test 2",
        status: 'passed'
      }]
    } as XTestSuite;
    const result = diff.diff(reportNew, reportOld);
    
    expect(result.tests?.length).toBe(2);
    expect(result.tests?.[0].test.title).toBe("Test 1");
    expect(result.tests?.[0].changes).toBe("added");
    expect(result.tests?.[1].test.title).toBe("Test 2");
    expect(result.tests?.[1].changes).toBe("unchanged");
  });
  test("Identifies that a test was removed", () => {
    const diff = new XFeatureDiff({});
    const reportNew = {
      title: "Suite 1",
      suites: [],
      tests: [{
        title: "Test 1",
        status: 'passed'
      }]
    } as XTestSuite;
    const reportOld = {
      title: "Suite 1",
      suites: [],
      tests: [
        {
          title: "Test 1",
          status: 'passed'
        },
        {
          title: "Test 2",
          status: 'passed'
        }]
      } as XTestSuite;
      const result = diff.diff(reportNew, reportOld);
      expect(result.tests?.length).toBe(2);
      expect(result.tests?.[0].test.title).toBe("Test 1");
      expect(result.tests?.[0].changes).toBe("unchanged");
      expect(result.tests?.[1].test.title).toBe("Test 2");
      expect(result.tests?.[1].changes).toBe("removed");
    }); 
  });
  test.describe("Generating", () => {
    test.only("Doesn't duplicate tests in suits", () => {
      const diff = new XFeatureDiff({});
      const test1: XTestTestDiff = {
        changes: "unchanged",
        test: {
          title: "Test 1",
          status: "passed"
        }
      } as XTestTestDiff;
      const suite1: XTestSuiteDiff = {
        title: "Suite 1",
        suites: [],
        tests: [test1],
        changes: "unchanged"
      } as XTestSuiteDiff;
      const suite2: XTestSuiteDiff = {
        title: "Suite 2",
        suites: [],
        tests: [],
        changes: "unchanged"
      } as XTestSuiteDiff;
      const results = diff.compareAllSuites([suite1, suite2]);
      expect(results.length).toBe(2);
      expect(results[0].title).toBe("Suite 1");
      expect(results[0].tests.length).toBe(1);
      expect(results[1].title).toBe("Suite 2");
      expect(results[1].tests.length).toBe(0);
    });
  });
  test.describe("Adapter", () => {
    let writeFileSyncStub: sinon.SinonStub;
    test.beforeEach(() => {
      writeFileSyncStub = sinon.stub(fs, 'writeFileSync');
      writeFileSyncStub.returns(undefined);
    });
    test.afterEach(() => {
      sinon.restore(); 
    });
    test("Accepts outputFile", () => {  
      // unstub writeFileSync
      writeFileSyncStub.restore();
      const outputFile = './test-data/test.md';
      const diff = new XFeatureDiff({outputFile, inputFile: './test-data/output.json'});
      diff.generateReport([{title: "Suite title", suites: [], tests: [{title: "Test title", status: "passed"}]}]);
      // look for the file
      expect(fs.existsSync(outputFile)).toBe(true);
      // delete the file
      fs.unlinkSync(outputFile);
    });
    test("Accepts a JSON input file", () => {
      const diff = new XFeatureDiff({inputFile: './test-data/output.json'});
      diff.generateReport([{title: "Suite title", suites: [], tests: [{title: "Test title", status: "passed"}]}]);
      const expected = `\n## Suite title\n - ✅ Test title\n`
      const actual = writeFileSyncStub.getCall(0)?.args[1];
      expect(actual).toBe(expected);
    });
    test("Accepts a switch that indicates to only render changes", () => {
      const diff = new XFeatureDiff({inputFile: './test-data/output.json', changesOnly: true});
      diff.generateReport([{title: "Suite title", suites: [], tests: [{title: "Test title", status: "passed"}]}]);
      const expected = `\n`;
      const actual = writeFileSyncStub.getCall(0)?.args[1];
      expect(actual).toBe(expected);
    });
  });
  
  test.describe("Markdown", () => {
    let writeFileSyncStub: sinon.SinonStub;
    let differ;
    test.beforeEach(() => {
      writeFileSyncStub = sinon.stub(fs, 'writeFileSync');
      writeFileSyncStub.returns(undefined);
      differ = new XFeatureDiff({});
    });
    test.afterEach(() => {
      sinon.restore(); 
    });
    test("Indicates in markdown that a suite title has changed", () => {
      const newTitle = "Suite 1";
      const oldTitle = "Suite 2";
      const test = {
        title: "Test 1",
        status: "passed"
      } as XTestResult;
      const reportOld = {
        title: oldTitle,
        suites: [],
        tests: [test]
      } as XTestSuite;
      const reportNew = {
        title: newTitle,
        suites: [],
        tests: [test]
      } as XTestSuite;
      const diffJson = differ.diff(reportNew, reportOld);
      differ.generateMarkdown([diffJson]);
      const expected = `\n## 🔄 ${newTitle}\n - ✅ Test 1\n`
      const actual = writeFileSyncStub.getCall(0)?.args[1];
      expect(actual).toBe(expected);
    });
    test("Indicates in markdown that a test was added", () => {
      const diff = new XFeatureDiff({});
      const suiteTitle = "Suite 1";
      const testTitle = "Test 1";
      const reportNew = {
        title: suiteTitle,
        suites: [],
        tests: [{
          title: testTitle,
          status: 'passed'
        }]
      } as XTestSuite;
      const reportOld = {
        title: suiteTitle,
        suites: [],
        tests: []
      } as XTestSuite;
      const result = diff.diff(reportNew, reportOld);
      differ.generateMarkdown([result]);
      const expected = "\n## " + suiteTitle + "\n - ✅ 🆕 " + testTitle + "\n"
      const actual = writeFileSyncStub.getCall(0)?.args[1];
      expect(actual).toBe(expected);
    });
    test("Indicates in markdown that a test was removed", () => {
      const diff = new XFeatureDiff({});
      const suiteTitle = "Suite 1";
      const testTitle = "Test 1";
      const reportNew = {
        title: suiteTitle,
        suites: [],
        tests: []
      } as XTestSuite;
      const reportOld = {
        title: suiteTitle,
        suites: [],
        tests: [{
          title: testTitle,
          status: 'passed'
        }]
      } as XTestSuite;
      const result = diff.diff(reportNew, reportOld);
      differ.generateMarkdown([result]);
      const expected = "\n## " + suiteTitle + "\n - ✅ 🗑️ " + testTitle + "\n"
      const actual = writeFileSyncStub.getCall(0)?.args[1];
      expect(actual).toBe(expected);
    });
  });