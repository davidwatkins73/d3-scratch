import '../styles/index.scss';
import * as d3 from "d3";
import testData from "./testData";
import * as tree from "./tree";

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


function draw(ctx) {
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
    tree.clip(ctx);
    draw(ctx);
}


function boot(rawData) {
    const hierData = d3
        .stratify()(rawData)
        .sum(d => (d.count || 0) + 10);

    const dimensions = {
        w: 600,
        h: 600,
        margin: 150,
    };

    const treeLayout = d3
        .tree()
        .size([dimensions.w, dimensions.h]);

    const treemapLayout = d3
        .treemap()
        .padding(16)
        .size([dimensions.w, dimensions.h])

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
        treeLayout,
        treemapLayout,
        nodeScale,
        hierData,
        mkTransition: (speed = 400) => d3
            .transition()
            .duration(speed)
            .ease(d3.easeCubicInOut),
        tweaker: TWEAKERS.leftRight,
        working: hierData,
        direction: "DESCEND",
        renderMode: "TREE"
    };

    draw(tree.clip(ctx));
    global.ctx = ctx;
}


boot(testData);


// --- interact

function swapOrientation() {
        global.ctx.tweaker = global.ctx.tweaker === TWEAKERS.leftRight
            ? TWEAKERS.topDown
            : TWEAKERS.leftRight;

        draw(global.ctx);
}


function swapRenderMode() {
        global.ctx.renderMode = global.ctx.renderMode === "TREE"
            ? "TREEMAP"
            : "TREE";

        draw(global.ctx);
}


function changeMaxDepth(amount = 1) {
    global.ctx.maxDepth = global.ctx.maxDepth + amount;
    draw(tree.clip(ctx));
}


function reset() {
    global.ctx.maxDepth = 3;
    global.ctx.working = ctx.hierData;
    draw(tree.clip(global.ctx))
}


function goUp() {
    const w = global.ctx.working;

    if (w.data._parent) {
        w.parent = w.data._parent;
        delete w.data._parent;

        global.ctx.direction = "ASCEND";
        global.ctx.working = w.parent;

        draw(tree.clip(global.ctx));
    }
}

global.changeMaxDepth = changeMaxDepth;
global.swapOrientation = swapOrientation;
global.swapRenderMode = swapRenderMode;
global.reset = reset;
global.goUp = goUp;

