import { MarkdownAdapter } from "x-feature-reporter/adapters/markdown";
import { existsSync, readFileSync } from 'fs';
export class XFeatureDiff {
    constructor(options) {
        if (options.inputFile) {
            // check if the file exists
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
    mergeSuites(suites) {
        const reports = [];
        suites.forEach(suite => {
            var _a;
            let titlePrefix = "";
            switch (suite.changes) {
                case "added":
                    titlePrefix = "🆕 ";
                    break;
                case "removed":
                    titlePrefix = "🗑️ ";
                    break;
                case "modified":
                    titlePrefix = "🔄 ";
                    break;
                case "unchanged":
                    break;
            }
            const report = {
                title: `${titlePrefix}${suite.title}`,
                suites: [],
                tests: []
            };
            console.log(suite.tests);
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
    compareAllSuites(newSuite, oldSuite) {
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
        const diffs = this.compareAllSuites(results, this.oldResults);
        const reports = this.mergeSuites(diffs);
        this.generateMarkdown(reports);
    }
}
