import { MarkdownAdapter } from "x-feature-reporter/adapters/markdown";
import { existsSync, readFileSync } from 'fs';
export class XFeatureDiff {
    constructor(options) {
        if (options.inputFile) {
            if (!existsSync(options.inputFile)) {
                this.oldResults = [];
            }
            else {
                const report = JSON.parse(readFileSync(options.inputFile, 'utf8'));
                this.oldResults = report;
            }
        }
        this.changesOnly = options.changesOnly || false;
        this.options = options;
    }
    compareSuites(newSuite, oldSuite) {
        const suiteComparison = {
            title: newSuite.title,
            changes: newSuite.title !== oldSuite.title ? "modified" : "unchanged",
            suites: [],
            tests: []
        };
        newSuite.tests.forEach(test => {
            const oldTest = oldSuite.tests.find(t => t.title === test.title);
            if (oldTest) {
                suiteComparison.tests.push({
                    changes: "unchanged",
                    test,
                    transparent: this.changesOnly
                });
            }
            else {
                suiteComparison.tests.push({
                    changes: "added",
                    test,
                });
            }
        });
        oldSuite.tests.forEach(test => {
            const newTest = newSuite.tests.find(t => t.title === test.title);
            if (!newTest) {
                suiteComparison.tests.push({
                    changes: "removed",
                    test,
                });
            }
        });
        return suiteComparison;
    }
    getChangeEmoji(change) {
        switch (change) {
            case "added":
                return "🆕 ";
            case "removed":
                return "🗑️ ";
            case "modified":
                return "🔄 ";
            case "unchanged":
                return "";
        }
    }
    mergeSuites(suites) {
        const reports = [];
        suites.forEach(suite => {
            var _a;
            const titlePrefix = this.getChangeEmoji(suite.changes);
            const report = {
                title: `${titlePrefix}${suite.title}`,
                suites: [],
                tests: []
            };
            (_a = suite.tests) === null || _a === void 0 ? void 0 : _a.forEach(test => {
                if (test.transparent) {
                    return;
                }
                const testTitlePrefix = this.getChangeEmoji(test.changes);
                report.tests.push(Object.assign(Object.assign({}, test.test), { title: `${testTitlePrefix}${test.test.title}` }));
            });
            reports.push(report);
        });
        return reports;
    }
    compareSuiteArray(newSuite, oldSuite) {
        const diffs = [];
        newSuite.forEach(suite => {
            const compareTo = oldSuite.find(s => s.title === suite.title);
            if (compareTo) {
                diffs.push(this.compareSuites(suite, compareTo));
            }
            else {
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
    generateMarkdown(results) {
        new MarkdownAdapter({
            outputFile: this.options.outputFile,
            embeddingPlaceholder: this.options.embeddingPlaceholder,
            fullReportLink: this.options.fullReportLink
        }).generateReport(results);
    }
    generateReport(results) {
        const diffs = this.compareSuiteArray(results, this.oldResults);
        const reports = this.mergeSuites(diffs);
        this.generateMarkdown(reports);
    }
}
