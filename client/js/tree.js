import * as d3 from "d3";


export function buildTreeDataFromFlattenedHierarchy(data = []) {
    const tree = d3
        .stratify()(data)
        .sum(d => d.count || 0);

    const nodesById = _.keyBy(
        tree.descendants(),
        d => d.id);

    return {
        tree,
        nodesById
    };
}


export function pruneTree(tree, maxDepth = 3) {
    const copy = tree.copy();
    copy.each(n => {
        const depthDelta = n.depth; // - startDepth;
        if (depthDelta >= maxDepth) {
            delete n.children;
        }
    });

    const allAncestors = tree.ancestors();
    return Object.assign(copy, {allAncestors});
}


export function sameNode(a, b) {
    return a.data.id === b.data.id;
}


export function mkEdgeId(d) {
    return d.data.parentId + "_" + d.data.id;
}






