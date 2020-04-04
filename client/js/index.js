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
        .data(data, d => d.data.id);

    const newNodes = nodes
        .enter()
        .append("circle")
        .classed("node", true)
        .attr("cx", 200)
        .attr("cy", 200)
        .attr("r", 1);

    nodes
        .merge(newNodes)
        .attr("stroke", "red")
        .attr("fill", "pink")
        .on("click", d => focus(d, ctx))
        .transition(ctx.trans)
        .attr("r", d => ctx.nodeScale(d.value))
        .attr("cy", d => d.x)
        .attr("cx", d => d.y);

    nodes
        .exit()
        .remove();
}


function drawEdges(ctx, data) {
    const edges = ctx
        .viz
        .selectAll(".edge")
        .data(data.filter(d => d.parent !== null), d => d.data.id);

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
        .attr("y1", d => d.parent.x)
        .attr("y2", d => d.x)
        .attr("x1", d => d.parent.y)
        .attr("x2", d => d.y);

    edges
        .exit()
        .remove();
}


function draw(ctx) {
    const root = ctx.layout(ctx.working.copy()).sum(d => d.count);
    ctx.nodeScale.domain([0, root.value]);
    const descendants = root.descendants();
    console.log({root, descendants, ctx})
    drawEdges(ctx, descendants);
    drawNodes(ctx, descendants);
}


function focus(d, ctx) {
    d._parent = d.parent;
    d.parent = null;
    ctx.working = d;
    draw(ctx);
}


function boot(rawData) {
    const hierData = d3.stratify()(rawData);

    const layout = d3
        .tree()
        .size([500, 400]);

    const nodeScale = d3
        .scalePow()
        .domain([0, 10])
        .range([3, 20]);

    const ctx = {
        viz: setupSvg(),
        trans: d3
            .transition()
            .duration(200)
            .ease(d3.easeLinear),
        layout,
        nodeScale,
        hierData,
        working: hierData.copy()
    };

    global.ctx = ctx;
    draw(ctx);
}



boot(testData);