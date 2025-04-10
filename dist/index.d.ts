import { XAdapter, XTestSuite, XTestResult } from "x-feature-reporter";
export type XChangeType = "added" | "removed" | "modified" | "unchanged";
export type XTestSuiteDiff = {
    title: string;
    changes: XChangeType;
    suites?: XTestSuiteDiff[];
    tests?: XTestTestDiff[];
    transparent?: boolean;
};
export type XTestTestDiff = {
    changes: XChangeType;
    test: XTestResult;
    transparent?: boolean;
};
export declare class XFeatureDiff implements XAdapter {
    private reportOld;
    private changesOnly;
    private options;
    constructor(options: Record<string, any>);
    diff(reportNew: XTestSuite, reportOld: XTestSuite): XTestSuiteDiff;
    generateMarkdown(diff: XTestSuiteDiff[]): void;
    generateReport(results: XTestSuite[]): void;
}
