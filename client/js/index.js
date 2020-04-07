import '../styles/index.scss';
import * as d3 from "d3";
import testData from "./testData";


const TWEAKERS = {
    topDown: {
        node: {
            x: d => d.x,
            y: d => d.y
        },
        label: (selection, ctx) => selection
            .attr("text-anchor", "middle")
            .attr("dy", (d, i) => ctx.nodeScale(d.value) + ctx.fontSize + 2)
            .attr("dx", 0)
    },
    leftRight: {
        node: {
            x: d => d.y,
            y: d => d.x
        },
        label: (selection, ctx) => selection
            .attr("text-anchor", "left")
            .attr("dx", d => ctx.nodeScale(d.value) + 2)
            .attr("dy", ctx.fontSize / 2.2)
    }
};


function setupSvg(dimensions) {
    const svg = d3
        .select("#viz")
        .append("svg")
        .attr("width", `${dimensions.w + dimensions.margin * 2}px`)
        .attr("height", `${dimensions.h + dimensions.margin * 2}px`);

    return svg
        .append("g")
        .attr("transform", `translate(${dimensions.margin} ${dimensions.margin})`);
}


function drawNodes(ctx, data) {
    const nodes = ctx
        .viz
        .selectAll(".node")
        .data(data, d => d.data.id);

    const newNodes = nodes
        .enter()
        .append("g")
        .classed("node", true)
        .style("cursor", "pointer")
        .on("click", d => focus(d, ctx));

    newNodes
        .append("text")
        .attr("fill", "black")
        .attr("font-size", `${ctx.fontSize}px`)
        .text(d => d.data.name);

    newNodes
        .append("circle")
        .attr("stroke", "red")
        .attr("fill", "pink")
        .attr("r", 1);

    const allNodes = nodes
        .merge(newNodes)
        .transition(ctx.mkTransition())
        .attr("transform", d => `translate(${ctx.tweaker.node.x(d)} ${ctx.tweaker.node.y(d)})`);

    allNodes
        .selectAll("circle")
        .transition(ctx.mkTransition())
        .attr("r", d => ctx.nodeScale(d.value));


    allNodes
        .selectAll("text")
        .transition(ctx.mkTransition())
        .call(ctx.tweaker.label, ctx);

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
        .attr("stroke", "#e5e5e5")
        .transition(ctx.mkTransition())
        .attr("stroke-width", d => ctx.edgeScale(d.value))
        .attr("y1", d => ctx.tweaker.node.y(d.parent))
        .attr("y2", d => ctx.tweaker.node.y(d))
        .attr("x1", d => ctx.tweaker.node.x(d.parent))
        .attr("x2", d => ctx.tweaker.node.x(d));

    edges
        .exit()
        .remove();
}


function draw(ctx) {
    const root = ctx
        .layout(ctx.working.copy())
        .sum(d => d.count || 0)
        ;

    ctx.nodeScale.domain([0, root.value]);
    ctx.edgeScale.domain([0, 10]);

    const descendants = root.descendants();
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

    const dimensions = {
        w: 600,
        h: 600,
        margin: 50,
    };

    const layout = d3
        .tree()
        .size([dimensions.w, dimensions.h]);

    const nodeScale = d3
        .scalePow()
        .domain([0, 10])
        .range([3, 20]);

    const edgeScale = d3
        .scalePow()
        .range([1, 3])
        .clamp(true);

    const ctx = {
        d3,
        dimensions,
        viz: setupSvg(dimensions),
        fontSize: 8,
        layout,
        nodeScale,
        edgeScale,
        hierData,
        mkTransition: () => d3
            .transition()
            .duration(300)
            .ease(d3.easeCubicInOut),
        tweaker: TWEAKERS.leftRight,
        working: hierData.copy()
    };

    global.ctx = ctx;
    draw(ctx);
}

boot(testData);

function swap() {
    global.ctx.tweaker = global.ctx.tweaker === TWEAKERS.leftRight
        ? TWEAKERS.topDown
        : TWEAKERS.leftRight;

    draw(global.ctx);
}

global.swap = swap;