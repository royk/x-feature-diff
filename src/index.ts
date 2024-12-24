import { XTestSuite } from "x-feature-reporter";

export enum XChangeType {
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
}

export class XFeatureDiff {
    public diff(reportNew: XTestSuite, reportOld: XTestSuite): XTestSuiteDiff {
        return {
            title: reportNew.title,
            changes: reportNew.title !== reportOld.title ? XChangeType.Modified : XChangeType.Unchanged,
            suites: [],
            transparent: true
        }
    }
}