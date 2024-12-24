"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XFeatureDiff = exports.XChangeType = void 0;
var XChangeType;
(function (XChangeType) {
    XChangeType["Added"] = "added";
    XChangeType["Removed"] = "removed";
    XChangeType["Modified"] = "modified";
    XChangeType["Unchanged"] = "unchanged";
})(XChangeType || (exports.XChangeType = XChangeType = {}));
class XFeatureDiff {
    diff(reportNew, reportOld) {
        return {
            title: reportNew.title,
            changes: reportNew.title !== reportOld.title ? XChangeType.Modified : XChangeType.Unchanged,
            suites: [],
            transparent: true
        };
    }
}
exports.XFeatureDiff = XFeatureDiff;
