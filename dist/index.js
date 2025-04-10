import { MarkdownAdapter } from "x-feature-reporter/adapters/markdown";
import { readFileSync } from 'fs';
export class XFeatureDiff {
    constructor(options) {
        if (options.inputFile) {
            const report = JSON.parse(readFileSync(options.inputFile, 'utf8'));
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
        reportOld.tests.forEach(test => {
            const newTest = reportNew.tests.find(t => t.title === test.title);
            if (!newTest) {
                tests.push({
                    changes: "removed",
                    test,
                });
            }
        });
        return {
            title: reportNew.title,
            changes: reportNew.title !== reportOld.title ? "modified" : "unchanged",
            suites: [],
            tests: tests,
            transparent: true
        };
    }
    generateMarkdown(diff) {
        const reports = [];
        diff.forEach(diff => {
            var _a;
            const titlePrefix = diff.changes === "modified" ? "🔄 " : "";
            const report = {
                title: `${titlePrefix}${diff.title}`,
                suites: [],
                tests: []
            };
            (_a = diff.tests) === null || _a === void 0 ? void 0 : _a.forEach(test => {
                if (test.transparent) {
                    return;
                }
                const emoji = test.changes === "added" ? "🆕 " : test.changes === "removed" ? "🗑️ " : "";
                report.tests.push(Object.assign(Object.assign({}, test.test), { title: `${emoji}${test.test.title}` }));
            });
            reports.push(report);
        });
        new MarkdownAdapter({
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
