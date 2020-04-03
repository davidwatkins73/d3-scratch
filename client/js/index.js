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


function drawNodes(viz, descendants) {
    const nodes = viz
        .selectAll(".node")
        .data(descendants);

    const newNodes = nodes
        .enter()
        .append("circle")
        .classed("node", true);

    nodes
        .merge(newNodes)
        .attr("r", d => Math.max(8 - d.depth, 2))
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("stroke", "red")
        .attr("fill", "pink")
        .on("click", d => focus(d));

    nodes
        .exit()
        .remove();
}


function drawEdges(viz, descendants) {
    const edges = viz
        .selectAll(".edge")
        .data(descendants);

    const newEdges = edges
        .enter()
        .filter(d => d.parent !== null)
        .append("line")
        .classed("edge", true);

    edges
        .merge(newEdges)
        .attr("x1", d => d.parent.x)
        .attr("x2", d => d.x)
        .attr("y1", d => d.parent.y)
        .attr("y2", d => d.y)
        .attr("stroke", "purple");

    edges
        .exit()
        .remove();
}


function draw(viz, hierData, layout) {
    const root = layout(hierData);
    const descendants = root.descendants();
    drawEdges(viz, descendants);
    drawNodes(viz, descendants);
    console.log({descendants, root})
}


function focus(d) {
    const descendants = d.descendants();
    draw(g, d);
}


function boot(layout) {
    const rawData = testData;
    const hierData = d3.stratify()(rawData);

    const g = setupSvg();
    draw(g, hierData, layout);
    return g;
}


const treeLayout = d3
    .tree()
    .size([500, 400]);

const g = boot(treeLayout);
