export function compare(oldSuites, newSuites) {
    const changes = [];
    newSuites.forEach(newSuite => {
        const oldSuite = oldSuites.find(oldSuite => oldSuite.title === newSuite.title);
        if (oldSuite) {
            changes.push({ change: "", suite: newSuite });
        }
        else {
            changes.push({ change: "added", suite: newSuite });
        }
    });
    return changes;
}
