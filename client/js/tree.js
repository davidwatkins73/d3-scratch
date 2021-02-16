export function clip(ctx) {
    const w = ctx.working;

    disableParent(w);

    const visit = (xs, curDepth = 0) => {
        xs.forEach(x => {
            x.depth = curDepth;
            if (curDepth > 0) {
                // repair parent links
                enableParent(x);
            }
            if (curDepth >= ctx.maxDepth) {
                disableChildren(x);
            } else {
                enableChildren(x);
                visit(x.children || [], curDepth + 1);
            }
        });
    };

    visit([w]);
    return ctx;
}


export function hasParents(d) {
    return d.parent || d.data._parent
}


export function sameNode(a, b) {
    return a.data.id === b.data.id;
}


export function disableParent(d) {
    if (d.parent) {
        d.data._parent = d.parent;
        delete d.parent;
    }
    return d;
}


export function mkEdgeId(d) {
    return d.data.parentId + "_" + d.data.id;
}


function disableChildren(d) {
    if (d.children) {
        d.data._children = d.children;
        delete d.children;
    }
    return d;
}


function enableChildren(d) {
    if (d.data._children) {
        d.children = d.data._children;
        delete d.data._children;
    }
    return d;
}


function enableParent(d) {
    if (d.data._parent) {
        d.parent = d.data._parent;
        delete d.data._parent;
    }
    return d;
}

