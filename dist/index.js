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
    constructor(options) {
        if (options.inputFile) {
            const fs = require('fs');
            const report = JSON.parse(fs.readFileSync(options.inputFile, 'utf8'));
            this.reportOld = report;
        }
        this.changesOnly = options.changesOnly || false;
        this.options = options;
    }
    diff(reportNew, reportOld) {
        const tests = [];
        reportNew.tests.forEach(test => {
            const oldTest = reportOld.tests.find(t => t.title === test.title);
            if (oldTest) {
                if (!this.changesOnly) {
                    tests.push({
                        changes: XChangeType.Unchanged,
                        test,
                    });
                }
            }
            else {
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
        };
    }
    generateMarkdown(diff) {
        const reports = [];
        diff.forEach(diff => {
            var _a;
            const titlePrefix = diff.changes === XChangeType.Modified ? "🔄 " : "";
            const report = {
                title: `${titlePrefix}${diff.title}`,
                suites: [],
                tests: []
            };
            (_a = diff.tests) === null || _a === void 0 ? void 0 : _a.forEach(test => {
                report.tests.push(Object.assign(Object.assign({}, test.test), { title: test.changes === XChangeType.Added ? `🆕 ${test.test.title}` : test.test.title }));
            });
            reports.push(report);
        });
        new markdown_1.MarkdownAdapter({
            outputFile: this.options.outputFile,
            embeddingPlaceholder: this.options.embeddingPlaceholder,
            fullReportLink: this.options.fullReportLink
        }).generateReport(reports);
    }
    generateReport(results) {
        const diffs = [];
        if (this.reportOld) {
            results.forEach(result => {
                diffs.push(this.diff(result, this.reportOld[0]));
            });
            this.generateMarkdown(diffs);
        }
    }
}
exports.XFeatureDiff = XFeatureDiff;
