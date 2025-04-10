import { XAdapter, XTestSuite, XTestResult } from "x-feature-reporter";
import { MarkdownAdapter } from "x-feature-reporter/adapters/markdown";
import { readFileSync } from 'fs';

export type XChangeType = "added" | "removed" | "modified" | "unchanged";

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
      const report = JSON.parse(readFileSync(options.inputFile, 'utf8'));
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
          changes: "unchanged",
          test,
          transparent: this.changesOnly
        });
      } else {
        tests.push({
          changes: "added",
          test,
        });
      }
    });
    reportOld.tests.forEach(test => {
      const newTest = reportNew.tests.find(t => t.title === test.title);
      if (!newTest) {
        tests.push({
          changes: "removed",
          test,
        });
      }
    });
    return {
      title: reportNew.title,
      changes: reportNew.title !== reportOld.title ? "modified" : "unchanged",
      suites: [],
      tests: tests,
      transparent: true
    }
  }
  
  public generateMarkdown(diff: XTestSuiteDiff[]): void {
    const reports:XTestSuite[] = [];
    diff.forEach(diff => {
    const titlePrefix = diff.changes === "modified" ? "🔄 " : "";
    const report:XTestSuite = {
      title: `${titlePrefix}${diff.title}`,
      suites: [],
      tests: []
      } as XTestSuite;
      diff.tests?.forEach(test => {
        if (test.transparent) {
          return;
        }
        const emoji = test.changes === "added" ? "🆕 " : test.changes === "removed" ? "🗑️ " : "";
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
