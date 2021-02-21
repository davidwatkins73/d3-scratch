import '../styles/index.scss';
import testData from "./testData";
import {buildTreeDataFromFlattenedHierarchy, pruneTree} from "./tree";
import {draw, setupSvg} from "./commonViz";


const dimensions = {
    w: 1000,
    h: 1000,
    marginLeft: 100,
    marginRight: 200,
    marginTop: 50,
    marginBottom: 50,
};


function boot(rawData) {
    const treeData = buildTreeDataFromFlattenedHierarchy(rawData);

    const ctx = {
        viz: setupSvg(dimensions),
        dimensions,
        maxDepth: 2,
        tree: treeData.tree,
        nodesById: treeData.nodesById,
        working: treeData.tree,
        orientation: "LEFT_RIGHT",      // LEFT_RIGHT | TOP_DOWN
        renderMode: "TREE"              // TREE | TREEMAP
    };

    ctx.working = pruneTree(
        ctx.working,
        ctx.maxDepth);

    draw(ctx);

    return ctx;
}


// --- interact

function swapOrientation(ctx) {
    ctx.orientation = ctx.orientation === "LEFT_RIGHT"
        ? "TOP_DOWN"
        : "LEFT_RIGHT";

    draw(ctx);
}


function swapRenderMode(ctx) {
    ctx.renderMode = ctx.renderMode === "TREE"
        ? "TREEMAP"
        : "TREE";

    draw(global.ctx);
}


function changeMaxDepth(ctx, amount = 1) {
    ctx.maxDepth = ctx.maxDepth + amount;
    ctx.maxDepth = _.clamp(global.ctx.maxDepth, 1, 10);
    ctx.working = pruneTree(
        ctx.nodesById[global.ctx.working.data.id],
        ctx.maxDepth);

    draw(ctx);
}


function reset(ctx) {
    ctx.maxDepth = 2;
    ctx.working = pruneTree(
        ctx.tree,
        ctx.maxDepth);

    draw(ctx)
}


function goUp(ctx) {
    if (_.isNumber(ctx.working.data.parentId)) {
        ctx.working = pruneTree(
            ctx.nodesById[ctx.working.data.parentId],
            ctx.maxDepth);
        draw(ctx);
    }
}


global.ctx = boot(testData);

global.changeMaxDepth = (amount) => changeMaxDepth(global.ctx, amount);
global.swapOrientation = () => swapOrientation(global.ctx);
global.swapRenderMode = () => swapRenderMode(global.ctx);
global.reset = () => reset(global.ctx);
global.goUp = () => goUp(global.ctx);

