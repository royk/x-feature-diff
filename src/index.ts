import { XAdapter, XTestSuite, XTestResult } from "x-feature-reporter";
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
  tests?: XTestTestDiff[];
  transparent?: boolean;
}

export type XTestTestDiff = {
  changes: XChangeType;
  test: XTestResult;
}

export class XFeatureDiff {
  public diff(reportNew: XTestSuite, reportOld: XTestSuite): XTestSuiteDiff {
    const tests:XTestTestDiff[] = [];
    reportNew.tests.forEach(test => {
      const oldTest = reportOld.tests.find(t => t.title === test.title);
      if (oldTest) {
        tests.push({
          changes: XChangeType.Unchanged,
          test,
        });
      } else {
        tests.push({
          changes: XChangeType.Added,
          test,
        });
      }
    });
    reportOld.tests.forEach(test => {
      const newTest = reportNew.tests.find(t => t.title === test.title);
      if (!newTest) {
        tests.push({
          changes: XChangeType.Removed,
          test,
        });
      }
    });
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
    const titlePrefix = diff.changes === XChangeType.Modified ? "🔄 " : "";
    const report:XTestSuite = {
      title: `${titlePrefix}${diff.title}`,
      suites: [],
      tests: []
    } as XTestSuite;
    diff.tests?.forEach(test => {
      report.tests.push({
        ...test.test,
        title: test.changes === XChangeType.Added ? `<span style=\"color: #2da44e\">${test.test.title}</span>`: test.test.title
      });
    });
    adapter.generateReport([report]);
  }
}
