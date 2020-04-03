import '../styles/index.scss';
import * as d3 from "d3";
import testData from "./testData";


function setupSvg() {
    const svg = d3
        .select("#viz")
        .append("svg")
        .attr("width", "600px")
        .attr("height", "600px");

    return svg
        .append("g")
        .attr("transform", "translate(50 50)");
}


function drawNodes(ctx, data) {
    const nodes = ctx
        .viz
        .selectAll(".node")
        .data(data, d => d.id);

    const newNodes = nodes
        .enter()
        .append("circle")
        .classed("node", true)
        .attr("cx", 200)
        .attr("cy", 200)
        .attr("r", 1);

    nodes
        .merge(newNodes)
        .attr("r", d => Math.max(8 - d.depth, 2))
        .attr("stroke", "red")
        .attr("fill", "pink")
        .on("click", d => focus(d, ctx))
        .transition(ctx.trans)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

    nodes
        .exit()
        .remove();
}


function drawEdges(ctx, data) {
    const edges = ctx
        .viz
        .selectAll(".edge")
        .data(data.filter(d => d.parent !== null), d => d.id);

    const newEdges = edges
        .enter()
        .append("line")
        .classed("edge", true)
        .attr("x1", 200)
        .attr("x2", 200)
        .attr("y1", 200)
        .attr("y2", 200);

    edges
        .merge(newEdges)
        .attr("stroke", "purple")
        .transition(ctx.trans)
        .attr("x1", d => d.parent.x)
        .attr("x2", d => d.x)
        .attr("y1", d => d.parent.y)
        .attr("y2", d => d.y);

    edges
        .exit()
        .remove();
}


function draw(ctx) {
    const root = ctx.layout(ctx.hierData);
    console.log("draw", ctx)
    const descendants = root.descendants();
    drawEdges(ctx, descendants);
    drawNodes(ctx, descendants);
}


function focus(d, ctx) {
    ctx.hierData.descendants().forEach(d => d.visible = false);
    d.descendants().forEach(d => d.data.visible = true);
    draw(ctx);
}


function boot(rawData) {
    const hierData = d3.stratify()(rawData);
    const layout = d3
        .tree()
        .size([500, 400]);

    const ctx = {
        viz: setupSvg(),
        trans: d3
            .transition()
            .duration(200)
            .ease(d3.easeLinear),
        layout,
        hierData
    };

    draw(ctx);
}


boot(testData);
