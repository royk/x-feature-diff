import type { XTestSuite as XTestSuite } from 'x-feature-reporter';
type XTestSuiteChange = {
    change: "added" | "removed" | "";
    suite: XTestSuite;
};
export declare function compare(oldSuites: XTestSuite[], newSuites: XTestSuite[]): XTestSuiteChange[];
export {};
