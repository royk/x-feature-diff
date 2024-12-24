import { XTestSuite } from "x-feature-reporter";
export declare enum XChangeType {
    Added = "added",
    Removed = "removed",
    Modified = "modified",
    Unchanged = "unchanged"
}
export type XTestSuiteDiff = {
    title: string;
    changes: XChangeType;
    suites: XTestSuiteDiff[];
    transparent?: boolean;
};
export declare class XFeatureDiff {
    diff(reportNew: XTestSuite, reportOld: XTestSuite): XTestSuiteDiff;
}
