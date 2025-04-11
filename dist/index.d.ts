import { XAdapter, XTestSuite, XTestResult } from "x-feature-reporter";
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
export declare class XFeatureDiff implements XAdapter {
    private oldResults;
    private changesOnly;
    private options;
    constructor(options: Record<string, any>);
    compareSuites(newSuite: XTestSuite, oldSuite: XTestSuite): XTestSuiteDiff;
    private getChangeEmoji;
    mergeSuites(suites: XTestSuiteDiff[]): XTestSuite[];
    compareSuiteArray(newSuite: XTestSuite[], oldSuite: XTestSuite[]): XTestSuiteDiff[];
    generateMarkdown(results: XTestSuite[]): void;
    generateReport(results: XTestSuite[]): void;
}
