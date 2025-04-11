import type { XTestSuite as XTestSuite } from 'x-feature-reporter';

type XTestSuiteChange = {
    change: "added" | "removed" | "";
    suite: XTestSuite;
}

export function compare(oldSuites: XTestSuite[], newSuites: XTestSuite[]) : XTestSuiteChange[] {
    const changes: XTestSuiteChange[] = [];
    newSuites.forEach(newSuite => {
        const oldSuite = oldSuites.find(oldSuite => oldSuite.title === newSuite.title);
        if (oldSuite) {
            changes.push({ change: "", suite: newSuite });
        } else {
            changes.push({ change: "added", suite: newSuite });
        }
    });
    oldSuites.forEach(oldSuite => {
        const newSuite = newSuites.find(newSuite => newSuite.title === oldSuite.title);
        if (!newSuite) {
            changes.push({ change: "removed", suite: oldSuite });
        }
    });
    return changes;
}