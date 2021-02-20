import {mkEdgeId, sameNode} from "./tree";
import {focus, mkTransition} from "./commonViz";

const COLORS = {
    node: {
        prunedParent: "#98f69c",
        prunedChildren: "#98f69c",
        root: "#89caee",
        normal: "#cef3f3"
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
        .on("mouseenter", d => console.log(`:[${nodeTitle(d)}]`, {pc: d.prunedChildren, pp: d.prunedParent, r: d.root}))
        .on("click", d => focus(d, ctx));

    newNodes
        .append("text")
        .text(d => d.data.name)
        .attr("fill", "black")
        .attr("font-size", `${ctx.fontSize}px`);

    newNodes
        .append("circle")
        .attr("stroke", "#56aa9f")
        .attr("stroke-width", 0.5)
        .attr("r", 1);

    const allNodes = newNodes
        .merge(nodes);

    allNodes
        .select("circle")
        .style("fill", d => {
            if (sameNode(ctx.tree, d)) { return COLORS.node.root; }
            else if (d.prunedChildren) { return COLORS.node.prunedChildren; }
            else if (d.prunedParent) { return COLORS.node.prunedParent; }
            else { return COLORS.node.normal; }
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
        .attr("stroke", "#e5e5e5")
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

