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
        .data(data);

    const newNodes = nodes
        .enter()
        .append("circle")
        .classed("node", true);

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
        .data(data.filter(d => d.parent !== null))
        // .filter();

    const newEdges = edges
        .enter()
        .append("line")
        .classed("edge", true);

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


function draw(ctx, data) {
    const root = ctx.layout(data || ctx.hierData);
    const descendants = root.descendants();
    drawEdges(ctx, descendants);
    drawNodes(ctx, descendants);
}


function focus(d, ctx) {
    delete d.data.parentId;
    const descendants = d3.stratify()(d.descendants().map(d => d.data));
    draw(ctx, descendants);
}


function boot(rawData) {
    const hierData = d3.stratify()(rawData);

    const layout = d3
        .tree()
        .size([500, 400]);

    const trans = d3
        .transition()
        .duration(200)
        .ease(d3.easeLinear);

    const g = setupSvg();
    const ctx = {
        viz: g,
        trans,
        layout,
        hierData
    };

    draw(ctx);
}


boot(testData);
