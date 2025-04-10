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
  transparent?: boolean;
}

export class XFeatureDiff implements XAdapter {
  private reportOld: XTestSuite;
  private changesOnly: boolean;
  private options: Record<string, any>;
  constructor(options: Record<string, any>) {
    if (options.inputFile) {
      const fs = require('fs');
      const report = JSON.parse(fs.readFileSync(options.inputFile, 'utf8'));
      this.reportOld = report;
    }
    this.changesOnly = options.changesOnly || false;
    this.options = options;
  }
  public diff(reportNew: XTestSuite, reportOld: XTestSuite): XTestSuiteDiff {
    const tests:XTestTestDiff[] = [];
    reportNew.tests.forEach(test => {
      const oldTest = reportOld.tests.find(t => t.title === test.title);
      if (oldTest) {
        tests.push({
          changes: XChangeType.Unchanged,
          test,
          transparent: this.changesOnly
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
  
  public generateMarkdown(diff: XTestSuiteDiff[]): void {
    const reports:XTestSuite[] = [];
    diff.forEach(diff => {
    const titlePrefix = diff.changes === XChangeType.Modified ? "🔄 " : "";
    const report:XTestSuite = {
      title: `${titlePrefix}${diff.title}`,
      suites: [],
      tests: []
      } as XTestSuite;
      diff.tests?.forEach(test => {
        if (test.transparent) {
          return;
        }
        const emoji = test.changes === XChangeType.Added ? "🆕 " : test.changes === XChangeType.Removed ? "🗑️ " : "";
        report.tests.push({
          ...test.test,
          title: `${emoji}${test.test.title}`
        });
      });
      reports.push(report);
    });
    new MarkdownAdapter({
      outputFile: this.options.outputFile,
      embeddingPlaceholder: this.options.embeddingPlaceholder,
      fullReportLink: this.options.fullReportLink
    }).generateReport(reports);
  }

  public generateReport(results: XTestSuite[]): void {
    const diffs:XTestSuiteDiff[] = [];
    if (this.reportOld) {
      results.forEach(result => {
        diffs.push(this.diff(result, this.reportOld[0]));
      });
      this.generateMarkdown(diffs);
    }
  }
}
