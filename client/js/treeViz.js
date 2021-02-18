import * as d3 from "d3";
import * as tree from "./tree";


export function setupSvg(dimensions) {
    const svg = d3
        .select("#viz")
        .append("svg")
        .style("border", "1px solid red")
        .attr("viewBox", `0 0 ${dimensions.w + dimensions.marginLeft + dimensions.marginRight} ${dimensions.h + dimensions.marginTop + dimensions.marginBottom}`  )
        .attr("height", `100%`)

    const g = svg
        .append("g")
        .attr("transform", `translate(${dimensions.marginLeft} ${dimensions.marginTop})`);

    const t =  g.append("g").classed("tree", true);
    t.append("g").classed("edges", true);
    t.append("g").classed("nodes", true);
    g.append("g").classed("treemap", true)

    return g;
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
            ?  `translate(${ctx.tweaker.node.x(d.parent)} ${ctx.tweaker.node.y(d.parent)})`
            :  `translate(0 0)`)
        .on("mouseenter", d => console.log(`:[${nodeTitle(d)}]`, d))
        .on("click", d => focus(d, ctx));

    newNodes
        .append("text")
        .text(d => d.data.name)
        .attr("fill", "black")
        .attr("font-size", `${ctx.fontSize}px`)

    newNodes
        .append("circle")
        .attr("stroke", "#56aa9f")
        .attr("fill", "#cbf7f2")
        .attr("r", 1);

    const trans = ctx.mkTransition();
    const allNodes = nodes
        .merge(newNodes)
        .transition(trans)
        .attr("transform", d => `translate(${ctx.tweaker.node.x(d)} ${ctx.tweaker.node.y(d)})`);

    allNodes
        .selectAll("circle")
        .attr("fill", d => {
            if (d.data._parent) { return "#8efabd"; }
            else if (d.data._children) { return "#8efabd"; }
            else if (d.children) { return "#b1d9f2" }
            else { return "#d8e8f8"; }
        })
        .transition(trans)
        .attr("r", d => ctx.nodeScale(d.value));

    allNodes
        .selectAll("text")
        .call(ctx.tweaker.label, ctx);

    // -- exits

    nodes
        .exit()
        .selectAll("circle")
        .transition(ctx.mkTransition())
        .attr("r", 0)

    nodes
        .exit()
        .selectAll("text")
        .transition(ctx.mkTransition())
        .attr("stroke", "white")

    nodes
        .exit()
        .transition(ctx.mkTransition())
        .remove();
}


function drawEdges(ctx, data) {
    const edgeData = data
        .filter(d => d.parent);

    const edges = ctx
        .viz
        .select(".edges")
        .selectAll(".edge")
        .data(edgeData, tree.mkEdgeId);

    edges
        .exit()
        .remove();

    const newEdges = edges
        .enter()
        .append("line")
        .classed("edge", true)
        .attr("data-edge-id", tree.mkEdgeId)
        .attr("x1", 200)
        .attr("x2", 200)
        .attr("y1", 200)
        .attr("y2", 200);

    edges
        .merge(newEdges)
        .attr("stroke", "#e5e5e5")
        .transition(ctx.mkTransition())
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
        .select(".treemap")
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
        .transition(ctx.mkTransition(100))
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
    if (tree.sameNode(d, ctx.working)) {
        if (tree.hasParents(d)) {
            ctx.direction = "ASCEND";
            goUp();
        }
    } else {
        ctx.direction = "DESCEND";
        ctx.working = tree.disableParent(d);
    }
    ctx.working = tree.clip(ctx.working);
    draw(ctx);
}
