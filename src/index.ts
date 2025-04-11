import { XAdapter, XTestSuite, XTestResult } from "x-feature-reporter";
import { MarkdownAdapter } from "x-feature-reporter/adapters/markdown";
import { existsSync, readFileSync } from 'fs';

export type XChangeType = "added" | "removed" | "modified" | "unchanged";

export interface XTestSuiteDiff {
  title: string;
  changes: XChangeType;
  suites?: XTestSuiteDiff[];
  tests?: XTestTestDiff[];
  transparent?: boolean;
}

export interface XTestTestDiff {
  changes: XChangeType;
  test: XTestResult;
  transparent?: boolean;
}

export class XFeatureDiff implements XAdapter {
  private oldResults: XTestSuite[];
  private changesOnly: boolean;
  private options: Record<string, any>;
  constructor(options: Record<string, any>) {
    if (options.inputFile) {
      // check if the file exists
      if (!existsSync(options.inputFile)) {
        this.oldResults = [];
      } else {
        const report = JSON.parse(readFileSync(options.inputFile, 'utf8'));
        this.oldResults = report;
      }
    }
    this.changesOnly = options.changesOnly || false;
    this.options = options;
  }
  public compareSuites(newSuite: XTestSuite, oldSuite: XTestSuite): XTestSuiteDiff {
    const tests:XTestTestDiff[] = [];
    newSuite.tests.forEach(test => {
      const oldTest = oldSuite.tests.find(t => t.title === test.title);
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
    oldSuite.tests.forEach(test => {
      const newTest = newSuite.tests.find(t => t.title === test.title);
      if (!newTest) {
        tests.push({
          changes: "removed",
          test,
        });
      }
    });
    return {
      title: newSuite.title,
      changes: newSuite.title !== oldSuite.title ? "modified" : "unchanged",
      suites: [],
      tests: tests,
    }
  }
  
  public mergeSuites(suites: XTestSuiteDiff[]): XTestSuite[] {
    const reports:XTestSuite[] = [];
    suites.forEach(suite => {
      let titlePrefix = "";
      switch (suite.changes) {
        case "added":
          titlePrefix = "🆕 ";
          break;
        case "removed":
          titlePrefix = "🗑️ ";
          break;
        case "modified":
          titlePrefix = "🔄 ";
          break;
        case "unchanged":
          break;
      }
      const report:XTestSuite = {
        title: `${titlePrefix}${suite.title}`,
        suites: [],
        tests: []
      } as XTestSuite;
      console.log(suite.tests);
      suite.tests?.forEach(test => {
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
   
    return reports;
  }

  public compareAllSuites(newSuite: XTestSuite[], oldSuite: XTestSuite[]): XTestSuiteDiff[] {
    const diffs:XTestSuiteDiff[] = [];
    newSuite.forEach(suite => {
      const compareTo = oldSuite.find(s => s.title === suite.title);
      if (compareTo) {
        diffs.push(this.compareSuites(suite, compareTo));
      } else {
        diffs.push({
          title: suite.title,
          changes: "added",
          tests: suite.tests.map(test => ({
            changes: "added",
            test: test
          }))
        });
      }
    });
    return diffs;
  }

  public generateMarkdown(results: XTestSuite[]): void {
    new MarkdownAdapter({
      outputFile: this.options.outputFile,
      embeddingPlaceholder: this.options.embeddingPlaceholder,
      fullReportLink: this.options.fullReportLink
    }).generateReport(results);
  }
  
  public generateReport(results: XTestSuite[]): void {
    const diffs = this.compareAllSuites(results, this.oldResults);
    const reports = this.mergeSuites(diffs);
    this.generateMarkdown(reports);
  }
}
