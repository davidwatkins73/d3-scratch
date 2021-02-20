import {mkEdgeId, sameNode} from "./tree";
import {focus, mkTransition} from "./commonViz";
import * as d3 from "d3";

const COLORS = {
    node: {
        prunedParent: { fill: "#98f69c", stroke: "#25ae24" },
        prunedChildren: { fill: "#98f69c", stroke: "#25ae24"},
        root: { fill: "#89caee", stroke: "#3d74c6"},
        normal: { fill: "#cef3f3", stroke: "#9dbff6"},
        ancestor: { fill: "#fc9898", stroke: "#e92929"},
        ancestorRoot: { fill: "#e92929", stroke: "#e92929"}
    },
    edge: {
        stroke: "#e5e5e5"
    }
};


export function drawTree(ctx) {
    const root = ctx
        .treeLayout(ctx.working);

    ctx.nodeScale.domain([1, root.value]);

    const descendants = root.descendants();
    drawEdges(ctx, descendants);
    drawNodes(ctx, descendants);
}


function drawAncestors(selection, ctx) {
    const ancestors = selection
        .selectAll(".ancestor")
        .data(d => _.tail(d.allAncestors) || []);

    ancestors
        .enter()
        .append("circle")
        .classed("ancestor", true)
        .attr("r", 3)
        .attr("fill", d => d.parent == null
            ? COLORS.node.ancestorRoot.fill
            : COLORS.node.ancestor.fill)
        .attr("stroke", COLORS.node.ancestor.stroke)
        .attr("stroke-width", 0.5)
        .attr("transform", (d, i) => `translate(${-10 + (i) * -7}, 0)`)
        .attr("title", d => d.data.name)
        .on("click", d => {
            focus(d, ctx);
            d3.event.stopPropagation();
        })
        .append("title")
        .text(d => d.data.name);


    ancestors
        .exit()
        .remove();

    return ancestors;
}


function drawNodes(ctx, data) {
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
        // .on("mouseenter", d => console.log(`:[${nodeTitle(d)}]`, {pc: d.prunedChildren, pp: d.prunedParent, r: d.root}))
        .on("click", d => focus(d, ctx));

    newNodes
        .append("text")
        .text(d => d.data.name)
        .attr("fill", "black")
        .attr("font-size", `${ctx.fontSize}px`);

    newNodes
        .append("circle")
        .attr("stroke-width", 0.5)
        .attr("r", 1);

    const allNodes = newNodes
        .merge(nodes);

    allNodes
        .call(drawAncestors, ctx);

    allNodes
        .select("circle")
        .style("stroke", d => determineNodeStroke(d, ctx))
        .style("fill", d => determineNodeFill(d, ctx));

    allNodes
        .select("text")
        .call(ctx.tweaker.label, ctx)

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
        .attr("r", 0);
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
        .attr("stroke", COLORS.edge.stroke)
        .transition(mkTransition())
        .attr("stroke-width", 1)
        .attr("x1", d => ctx.tweaker.node.x(d.parent))
        .attr("x2", d => ctx.tweaker.node.x(d))
        .attr("y1", d => ctx.tweaker.node.y(d.parent))
        .attr("y2", d => ctx.tweaker.node.y(d));
}


function nodeTitle(d) {
    return d.data.code || d.data.name;
}


function determineNodeColor(d, ctx) {
    if (sameNode(ctx.tree, d)) { return COLORS.node.root; }
    else if (d.prunedChildren) { return COLORS.node.prunedChildren; }
    else if (d.prunedParent) { return COLORS.node.prunedParent; }
    else { return COLORS.node.normal; }
}


function determineNodeStroke(d, ctx) {
    return determineNodeColor(d, ctx).stroke;
}


function determineNodeFill(d, ctx) {
    return determineNodeColor(d, ctx).fill;
}