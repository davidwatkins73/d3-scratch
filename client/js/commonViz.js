import * as d3 from "d3";
import {pruneTree, sameNode} from "./tree";
import {drawTreemap} from "./treeMapViz";
import {drawTree} from "./treeViz";



export function draw(ctx) {
    switch (ctx.renderMode) {
        case "TREE":
            show(ctx,".tree");
            hide(ctx,".treeMap")
            return drawTree(ctx);
        case "TREEMAP":
            show(ctx,".treeMap");
            hide(ctx,".tree")
            return drawTreemap(ctx);
        default:
            throw `Unknown renderMode: ${ctx.renderMode}`;
    }
}

export function setupSvg(dimensions) {
    const svg = d3
        .select("#viz")
        .append("svg")
        .style("border", "1px solid red")
        .attr("viewBox", `0 0 ${totalWidth(dimensions)} ${totalHeight(dimensions)}`  )
        .attr("height", `100%`)

    const g = svg
        .append("g")
        .attr("transform", `translate(${dimensions.marginLeft} ${dimensions.marginTop})`);

    g.selectAll("g")
        .data(["tree", "edges", "nodes", "treeMap"], d => d)
        .enter()
        .append("g")
        .attr("class", d => d);

    return g;
}


export function focus(d, ctx) {
    if (sameNode(d, ctx.working)) {
        if (d.allAncestors.length > 1) {
            ctx.working = pruneTree(
                ctx.nodesById[d.data.parentId],
                ctx.maxDepth);
        }
    } else {
        ctx.working = pruneTree(
            ctx.nodesById[d.data.id],
            ctx.maxDepth);
    }

    draw(ctx);
}


export function mkTransition(speed = 700) {
    return d3
        .transition()
        .ease(d3.easeExpOut)
        .duration(speed);
}


function show(ctx, name) {
    ctx.viz
        .select(name)
        .style("display", "");
}


function hide(ctx, name) {
    ctx.viz
        .select(name)
        .style("display", "none");
}





function totalWidth(dimensions) {
    return dimensions.w
        + dimensions.marginLeft
        + dimensions.marginRight;
}


function totalHeight(dimensions) {
    return dimensions.h
        + dimensions.marginTop
        + dimensions.marginBottom;
}
