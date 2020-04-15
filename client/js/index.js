import '../styles/index.scss';
import * as d3 from "d3";
import testData from "./testData";


const TWEAKERS = {
    topDown: {
        node: {
            x: d => d.x,
            y: d => d.y,
            initialTransforms: {
                ASCEND: (ctx) => `translate(${ctx.dimensions.w / 2} ${ctx.dimensions.h / 1.2})`,
                DESCEND: (ctx) => `translate(${ctx.dimensions.w / 2} ${ctx.dimensions.h / 1.2})`
            }
        },
        label: (selection, ctx) => selection
            .attr("text-anchor", "middle")
            .attr("dy", d => ctx.nodeScale(d.value) + ctx.fontSize + 2)
            .attr("dx", 0)
    },
    leftRight: {
        node: {
            x: d => d.y,
            y: d => d.x,
            initialTransforms: {
                ASCEND: (ctx) => `translate(${ctx.dimensions.margin/2 * -1} ${ctx.dimensions.h / 2})`,
                DESCEND: (ctx) => `translate(${ctx.dimensions.w + ctx.dimensions.margin/2} ${ctx.dimensions.h / 2})`
            }
        },
        label: (selection, ctx) => selection
            .attr("text-anchor", "left")
            .attr("dx", d => ctx.nodeScale(d.value) + 2)
            .attr("dy", ctx.fontSize / 1.2)
    }
};


function setupSvg(dimensions) {
    const svg = d3
        .select("#viz")
        .append("svg")
        .attr("width", `${dimensions.w + dimensions.margin * 2}px`)
        .attr("height", `${dimensions.h + dimensions.margin * 2}px`);

    const g = svg
        .append("g")
        .attr("transform", `translate(${dimensions.margin} ${dimensions.margin})`);

    g.append("g").classed("edges", true);
    g.append("g").classed("nodes", true);

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
        .attr("transform", ctx.tweaker.node.initialTransforms[ctx.direction](ctx))
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

    const allNodes = nodes
        .merge(newNodes)
        .transition(ctx.mkTransition())
        .attr("transform", d => `translate(${ctx.tweaker.node.x(d)} ${ctx.tweaker.node.y(d)})`);

    allNodes
        .selectAll("circle")
        .attr("fill", d => {
            if (d.data._parent) { return "#8efabd"; }
            else if (d.data._children) { return "#8efabd"; }
            else if (d.children) { return "#b1d9f2" }
            else { return "#d8e8f8"; }
        })
        .transition(ctx.mkTransition())
        .attr("r", d => ctx.nodeScale(d.value));

    allNodes
        .selectAll("text")
        .transition(ctx.mkTransition())
        .call(ctx.tweaker.label, ctx);

    // -- exits

    nodes
        .exit()
        .selectAll("circle")
        .transition(ctx.mkTransition(100))
        .attr("r", 0)

    nodes
        .exit()
        .selectAll("text")
        .transition(ctx.mkTransition(100))
        .attr("stroke", "white")

    nodes
        .exit()
        .transition(ctx.mkTransition(100))
        .remove();
}


function mkEdgeId(d) {
    return d.data.parentId + "_" + d.data.id;
}


function drawEdges(ctx, data) {
    const edgeData = data
        .filter(d => d.parent);

    const edges = ctx
        .viz
        .select(".edges")
        .selectAll(".edge")
        .data(edgeData, d => mkEdgeId(d));

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


function draw(ctx) {
    const root = ctx
        .layout(ctx.working);

    ctx.nodeScale.domain([1, root.value]);

    const descendants = root.descendants();
    drawEdges(ctx, descendants);
    drawNodes(ctx, descendants);
}


function clipTree(ctx) {
    const w = ctx.working;

    disableParent(w);

    const visit = (xs, curDepth = 0) => {
        xs.forEach(x => {
            x.depth = curDepth;
            if (curDepth > 0) {
                // repair parent links
                enableParent(x);
            }
            if (curDepth >= ctx.maxDepth) {
                disableChildren(x);
            } else {
                enableChildren(x);
                visit(x.children || [], curDepth + 1);
            }
        });
    };

    visit([w]);
    return ctx;
}


function focus(d, ctx) {
    if (sameNode(d, ctx.working)) {
        if (hasParents(d)) {
            ctx.direction = "ASCEND";
            goUp();
        }
    } else {
        ctx.direction = "DESCEND";
        ctx.working = disableParent(d);
    }
    clipTree(ctx);
    draw(ctx);
}


function hasParents(d) {
    return d.parent || d.data._parent
}


function sameNode(a, b) {
    return a.data.id === b.data.id;
}


function disableParent(d) {
    if (d.parent) {
        d.data._parent = d.parent;
        delete d.parent;
    }
    return d;
}


function disableChildren(d) {
    if (d.children) {
        d.data._children = d.children;
        delete d.children;
    }
    return d;
}


function enableChildren(d) {
    if (d.data._children) {
        d.children = d.data._children;
        delete d.data._children;
    }
    return d;
}


function enableParent(d) {
    if (d.data._parent) {
        d.parent = d.data._parent;
        delete d.data._parent;
    }
    return d;
}



function boot(rawData) {
    const hierData = d3
        .stratify()(rawData)
        .sum(d => d.count || 0);

    const dimensions = {
        w: 600,
        h: 600,
        margin: 150,
    };

    const layout = d3
        .tree()
        .size([dimensions.w, dimensions.h]);

    const nodeScale = d3
        .scaleLog()
        .domain([1, 20])
        .range([2, 10])
        .clamp(true);

    const ctx = {
        d3,
        dimensions,
        viz: setupSvg(dimensions),
        fontSize: 8,
        maxDepth: 4,
        layout,
        nodeScale,
        hierData,
        mkTransition: (speed = 400) => d3
            .transition()
            .duration(speed)
            .ease(d3.easeCubicInOut),
        tweaker: TWEAKERS.leftRight,
        working: hierData,
        direction: "DESCEND"
    };

    draw(clipTree(ctx));
    global.ctx = ctx;
}


boot(testData);


// --- interact

function swap() {
        global.ctx.tweaker = global.ctx.tweaker === TWEAKERS.leftRight
            ? TWEAKERS.topDown
            : TWEAKERS.leftRight;

        draw(global.ctx);
}


function changeMaxDepth(amount = 1) {
    global.ctx.maxDepth = global.ctx.maxDepth + amount;
    draw(clipTree(ctx));
}


function reset() {
    global.ctx.maxDepth = 3;
    global.ctx.working = ctx.hierData;
    draw(clipTree(global.ctx))
}


function goUp() {
    const w = global.ctx.working;


    if (w.data._parent) {
        w.parent = w.data._parent;
        delete w.data._parent;

        global.ctx.direction = "ASCEND";
        global.ctx.working = w.parent;

        draw(clipTree(global.ctx));
    }
}

global.changeMaxDepth = changeMaxDepth;
global.swap = swap;
global.reset = reset;
global.goUp = goUp;

