import { MarkdownAdapter } from "x-feature-reporter/adapters/markdown";
import { readFileSync } from 'fs';
export class XFeatureDiff {
    constructor(options) {
        if (options.inputFile) {
            const report = JSON.parse(readFileSync(options.inputFile, 'utf8'));
            this.oldResults = report;
        }
        this.changesOnly = options.changesOnly || false;
        this.options = options;
    }
    compareSuites(newSuite, oldSuite) {
        const tests = [];
        newSuite.tests.forEach(test => {
            const oldTest = oldSuite.tests.find(t => t.title === test.title);
            if (oldTest) {
                tests.push({
                    changes: "unchanged",
                    test,
                    transparent: this.changesOnly
                });
            }
            else {
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
        };
    }
    compareAllSuites(suites) {
        const reports = [];
        suites.forEach(suite => {
            var _a;
            const titlePrefix = suite.changes === "modified" ? "🔄 " : "";
            const report = {
                title: `${titlePrefix}${suite.title}`,
                suites: [],
                tests: []
            };
            (_a = suite.tests) === null || _a === void 0 ? void 0 : _a.forEach(test => {
                if (test.transparent) {
                    return;
                }
                const emoji = test.changes === "added" ? "🆕 " : test.changes === "removed" ? "🗑️ " : "";
                report.tests.push(Object.assign(Object.assign({}, test.test), { title: `${emoji}${test.test.title}` }));
            });
            reports.push(report);
        });
        return reports;
    }
    generateReport(results) {
        const diffs = [];
        if (this.oldResults) {
            results.forEach(result => {
                diffs.push(this.compareSuites(result, this.oldResults[0]));
            });
            const reports = this.compareAllSuites(diffs);
            new MarkdownAdapter({
                outputFile: this.options.outputFile,
                embeddingPlaceholder: this.options.embeddingPlaceholder,
                fullReportLink: this.options.fullReportLink
            }).generateReport(reports);
        }
    }
}
