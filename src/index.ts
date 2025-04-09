import { XAdapter, XTestSuite } from "x-feature-reporter";
import { MarkdownAdapter } from "x-feature-reporter/adapters/markdown";

export enum XChangeType {
  Added = "added",
  Removed = "removed",
  Modified = "modified",
  Unchanged = "unchanged"
}

export type XTestSuiteDiff = {
  title: string;
  changes: XChangeType;
  suites?: XTestSuiteDiff[];
  tests?: XTestSuiteDiff[];
  transparent?: boolean;
}

export class XFeatureDiff {
  public diff(reportNew: XTestSuite, reportOld: XTestSuite): XTestSuiteDiff {
    const tests:XTestSuiteDiff[] = [];
    if (reportNew.tests.length > reportOld.tests.length) {
      reportNew.tests.forEach(test => {
        tests.push({
          title: test.title,
          changes: XChangeType.Added,
        });
      });
    }
    return {
      title: reportNew.title,
      changes: reportNew.title !== reportOld.title ? XChangeType.Modified : XChangeType.Unchanged,
      suites: [],
      tests: tests,
      transparent: true
    }
  }
  
  public generateMarkdown(diff: XTestSuiteDiff): void {
    const adapter:XAdapter = new MarkdownAdapter();
    const titlePrefix = diff.changes === XChangeType.Modified ? "🔄" : "";
    const report:XTestSuite = {
      title: `${titlePrefix} ${diff.title}`,
      suites: [],
      tests: [{
        title: "Test 1",
        status: "passed",
        testType: "behavior"
      }]
    } as XTestSuite;
    adapter.generateReport([report]);
  }
}
