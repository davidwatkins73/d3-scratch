import '../styles/index.scss';
import * as d3 from "d3";
import testData from "./testData";
import {buildTreeDataFromFlattenedHierarchy, pruneTree} from "./tree";
import {draw, setupSvg} from "./commonViz";

const TWEAKERS = {
    topDown: {
        node: {
            x: d => d.x,
            y: d => d.y
        },
        label: (selection, ctx) => selection
            .attr("text-anchor", "middle")
            .attr("dy", d => ctx.nodeScale(d.value) + ctx.fontSize + 2)
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
            .attr("dy", ctx.fontSize / 1.2)
    }
};


function boot(rawData) {
    const treeData = buildTreeDataFromFlattenedHierarchy(rawData);

    const dimensions = {
        w: 1000,
        h: 1000,
        marginLeft: 100,
        marginRight: 200,
        marginTop: 50,
        marginBottom: 50,
    };

    const treeLayout = d3
        .tree()
        .size([
            dimensions.w,
            dimensions.h
        ]);

    const treemapLayout = d3
        .treemap()
        .padding(32)
        .size([dimensions.w, dimensions.h])

    const nodeScale = d3
        .scaleLog()
        .domain([1, 20])
        .range([5, 20])
        .clamp(true);

    const ctx = {
        viz: setupSvg(dimensions),
        fontSize: 8,
        maxDepth: 2,
        treeLayout,
        treemapLayout,
        nodeScale,
        tree: treeData.tree,
        nodesById: treeData.nodesById,
        working: treeData.tree,
        tweaker: TWEAKERS.leftRight,
        renderMode: "TREE"
    };

    ctx.working = pruneTree(
        ctx.working,
        ctx.maxDepth);

    draw(ctx);
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
    global.ctx.maxDepth = _.clamp(global.ctx.maxDepth, 1, 10);
    global.ctx.working = pruneTree(
        ctx.nodesById[global.ctx.working.data.id],
        global.ctx.maxDepth);
    draw(global.ctx);
}


function reset() {
    const ctx = global.ctx;
    ctx.working = pruneTree(
        ctx.tree,
        ctx.maxDepth);
    draw(ctx)
}


function goUp() {
    const ctx = global.ctx;
    const w = ctx.working;

    if (w.data.parentId) {
        ctx.working = pruneTree(
            ctx.nodesById[w.data.parentId],
            ctx.maxDepth);
        draw(ctx);
    }
}

global.changeMaxDepth = changeMaxDepth;
global.swapOrientation = swapOrientation;
global.swapRenderMode = swapRenderMode;
global.reset = reset;
global.goUp = goUp;

