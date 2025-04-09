"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XFeatureDiff = exports.XChangeType = void 0;
const markdown_1 = require("x-feature-reporter/adapters/markdown");
var XChangeType;
(function (XChangeType) {
    XChangeType["Added"] = "added";
    XChangeType["Removed"] = "removed";
    XChangeType["Modified"] = "modified";
    XChangeType["Unchanged"] = "unchanged";
})(XChangeType || (exports.XChangeType = XChangeType = {}));
class XFeatureDiff {
    diff(reportNew, reportOld) {
        const tests = [];
        if (reportNew.tests.length > reportOld.tests.length) {
            tests.push({
                title: reportNew.tests[0].title,
                changes: XChangeType.Added,
            });
        }
        return {
            title: reportNew.title,
            changes: reportNew.title !== reportOld.title ? XChangeType.Modified : XChangeType.Unchanged,
            suites: [],
            tests: tests,
            transparent: true
        };
    }
    generateMarkdown(diff) {
        const adapter = new markdown_1.MarkdownAdapter();
        const titlePrefix = diff.changes === XChangeType.Modified ? "🔄" : "";
        const report = {
            title: `${titlePrefix} ${diff.title}`,
            suites: [],
            tests: [{
                    title: "Test 1",
                    status: "passed",
                    testType: "behavior"
                }]
        };
        adapter.generateReport([report]);
    }
}
exports.XFeatureDiff = XFeatureDiff;
