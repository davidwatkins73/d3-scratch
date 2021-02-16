import '../styles/index.scss';
import * as d3 from "d3";
import testData from "./testData";
import * as tree from "./tree";
import * as viz from "./treeViz";

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



function boot(rawData) {
    const hierData = d3
        .stratify()(rawData)
        .sum(d => (d.count || 0) + 10);

    const dimensions = {
        w: 500,
        h: 500,
        marginLeft: 50,
        marginRight: 100,
        marginTop: 50,
        marginBottom: 50,
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
        viz: viz.setupSvg(dimensions),
        fontSize: 8,
        maxDepth: 4,
        treeLayout,
        treemapLayout,
        nodeScale,
        hierData,
        mkTransition: (speed = 700) => d3
            .transition()
            .ease(d3.easeExpOut)
            .duration(speed),
        tweaker: TWEAKERS.leftRight,
        working: hierData,
        direction: "DESCEND",
        renderMode: "TREE"
    };

    ctx.working = tree.clip(ctx.working, ctx.maxDepth);

    viz.draw(ctx);

    global.ctx = ctx;
}


boot(testData);


// --- interact

function swapOrientation() {
    global.ctx.tweaker = global.ctx.tweaker === TWEAKERS.leftRight
        ? TWEAKERS.topDown
        : TWEAKERS.leftRight;

    viz.draw(global.ctx);
}


function swapRenderMode() {
    global.ctx.renderMode = global.ctx.renderMode === "TREE"
        ? "TREEMAP"
        : "TREE";

    viz.draw(global.ctx);
}


function changeMaxDepth(amount = 1) {
    global.ctx.maxDepth = global.ctx.maxDepth + amount;
    global.ctx.working = tree.clip(ctx.working, global.ctx.maxDepth);
    viz.draw(global.ctx);
}


function reset() {
    const ctx = global.ctx;
    ctx.maxDepth = 3;
    ctx.working = ctx.hierData;
    ctx.working = tree.clip(ctx.working);
    viz.draw(ctx)
}


function goUp() {
    const ctx = global.ctx;
    const w = ctx.working;

    if (w.data._parent) {
        w.parent = w.data._parent;
        delete w.data._parent;

        ctx.direction = "ASCEND";
        ctx.working = w.parent;

        ctx.working = tree.clip(ctx.working)
        viz.draw(ctx);
    }
}

global.changeMaxDepth = changeMaxDepth;
global.swapOrientation = swapOrientation;
global.swapRenderMode = swapRenderMode;
global.reset = reset;
global.goUp = goUp;

