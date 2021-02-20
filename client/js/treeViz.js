import * as d3 from "d3";
import * as tree from "./tree";
import {mkEdgeId, pruneTree, sameNode} from "./tree";

const colors = {
    node: {
        prunedParent: "#98f69c",
        prunedChildren: "#98f69c",
        root: "#89caee",
        normal: "#cef3f3"
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


function drawNodes(ctx, data) {
    console.log("drawNodes", {data});
    const nodes = ctx
        .viz
        .select(".nodes")
        .selectAll(".node")
        .data(data, d => d.data.id);

    const newNodes = nodes
        .enter()
        .append("g")
        .classed("node", true)
        .style("cursor", "pointer")
        .attr("transform", d => d.parent
            ?  `translate(${d.parent.x} ${ctx.tweaker.node.y(d.parent)})`
            :  `translate(0 0)`)
        .on("mouseenter", d => console.log(`:[${nodeTitle(d)}]`, d.pruned))
        .on("click", d => focus(d, ctx));

    newNodes
        .append("text")
        .text(d => d.data.name)
        .attr("fill", "black")
        .attr("font-size", `${ctx.fontSize}px`)

    newNodes
        .append("circle")
        .attr("stroke", "#56aa9f")
        .attr("r", 1);

    const allNodes = newNodes
        .merge(nodes);

    allNodes
        .select("circle")
        .style("fill", d => {
            if (sameNode(ctx.tree, d)) { return colors.node.root; }
            else if (d.pruned) { return colors.node.prunedChildren; }
            else if ( !_.isEmpty(d.allAncestors)) { return colors.node.prunedParent; }
            else { return colors.node.normal; }
        });

    allNodes
        .select("text")
        .call(ctx.tweaker.label, ctx);

    allNodes
        .transition(mkTransition())
        .style("opacity", 1) // needed in case max depth is quickly toggled before previous transition has completed
        .attr("transform", d => `translate(${ctx.tweaker.node.x(d)} ${ctx.tweaker.node.y(d)})`)
        .select("circle")
        .attr("r", d => ctx.nodeScale(d.value));

    // -- exits

    const exit = nodes
        .exit()
        .transition(mkTransition())
        .style("opacity", 0)
        .remove();

    exit
        .select("circle")
        .attr("r", 0)

}


function drawEdges(ctx, data) {
    const edgeData = data
        .filter(d => d.parent);

    const edges = ctx
        .viz
        .select(".edges")
        .selectAll(".edge")
        .data(edgeData, mkEdgeId);

    edges
        .exit()
        .remove();

    const newEdges = edges
        .enter()
        .append("line")
        .classed("edge", true)
        .attr("data-edge-id", mkEdgeId)
        .attr("x1", 200)
        .attr("x2", 200)
        .attr("y1", 200)
        .attr("y2", 200);

    edges
        .merge(newEdges)
        .attr("stroke", "#e5e5e5")
        .transition(mkTransition())
        .attr("stroke-width", 1)
        .attr("x1", d => ctx.tweaker.node.x(d.parent))
        .attr("x2", d => ctx.tweaker.node.x(d))
        .attr("y1", d => ctx.tweaker.node.y(d.parent))
        .attr("y2", d => ctx.tweaker.node.y(d))
}


function nodeTitle(d) {
    return d.data.code || d.data.name
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


function drawTree(ctx) {
    const root = ctx
        .treeLayout(ctx.working);

    ctx.nodeScale.domain([1, root.value]);

    const descendants = root.descendants();
    drawEdges(ctx, descendants);
    drawNodes(ctx, descendants);
}


function drawTreemap(ctx) {
    const root = ctx
        .treemapLayout(ctx.working)

    const descendants = root
        .descendants();

    const nodes = ctx
        .viz
        .select(".treeMap")
        .selectAll(".block")
        .data(descendants, d => d.data.id);

    const newNodes = nodes
        .enter()
        .append("g")
        .classed("block", true);

    newNodes
        .append("rect")

    newNodes
        .filter(d => d.depth <   3)
        .append("text")
        .attr("fill", "black")
        .text(d => d.data.name)

    nodes
        .merge(newNodes)
        .selectAll("rect")
        .attr("fill", "pink")
        .attr("stroke", "red")
        .attr("opacity", 0.2)
        .on("click.focus", d => {
            if (d.depth === 1) {
                focus(d, ctx)
            } else if (d.depth > 1) {
                let ptr = d.parent;
                while (ptr !== null) {
                    if (ptr.depth === 1) {
                        focus(ptr, ctx);
                        break;
                    }
                    ptr = ptr.parent;
                }
            }
        })
        .transition(mkTransition(100))
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0);

    nodes.merge(newNodes)
        .selectAll("text")
        .attr("font-size", 9)
        .attr("dx", d => d.x0 + 10)
        .attr("dy", d => d.y0 + 11);

    nodes.exit()
        .remove();
}


function focus(d, ctx) {
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


function mkTransition(speed = 700) {
    return d3
        .transition()
        .ease(d3.easeExpOut)
        .duration(speed);
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
