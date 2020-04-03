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


function draw(viz, root) {
    const descendants = root.descendants();

    const nodes = viz
        .selectAll(".node")
        .data(descendants);

    nodes
        .enter()
        .append("circle")
        .classed("node", true)
        .attr("r", d => Math.max(8 - d.depth, 2))
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("stroke", "red")
        .attr("fill", "pink")
        ;

    const edges = viz
        .selectAll(".edge")
        .data(descendants);

    edges
        .enter()
        .filter(d => d.parent !== null)
        .append("line")
        .classed("edge", true)
        .attr("x1", d => d.parent.x)
        .attr("x2", d => d.x)
        .attr("y1", d => d.parent.y)
        .attr("y2", d => d.y)
        .attr("stroke", "purple")
        ;
}


const rawData = testData;
const hierData = d3.stratify()(rawData);
const treeRoot = d3
    .tree()
    .size([500, 400])
    (hierData);

const g = setupSvg();
draw(g, treeRoot);

console.log({data: rawData, hierData, treeRoot});
