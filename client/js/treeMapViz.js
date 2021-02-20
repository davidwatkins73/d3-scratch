import {focus, mkTransition} from "./commonViz";
import * as d3 from "d3";

const FONT = {
    node: {
        size: "18px",
        color: "#447"
    }
};

const COLORS = {
    node: {
        fill: "#c5eef5", stroke: "#59c3f6",
    }
};


export function drawTreemap(ctx) {
    const root = ctx
        .treemapLayout(ctx.working)

    const descendants = root
        .descendants();

    const nodes = ctx
        .viz
        .select(".treeMap")
        .selectAll(".block")
        .data(descendants, d => d.data.id);

    const newNodes = nodes
        .enter()
        .append("g")
        .classed("block", true);

    newNodes
        .append("rect");

    newNodes
        // .filter(d => d.depth < 2)
        .append("text")
        .attr("font-size", FONT.node.size)
        .attr("fill", FONT.node.color);

    nodes
        .merge(newNodes)
        .select("rect")
        .attr("fill", COLORS.node.fill)
        .attr("stroke", COLORS.node.stroke)
        .attr("opacity", 0.2)
        .on("click.focus", d => {
            focus(d, ctx);
            d3.event.stopPropagation();
        })
        .transition(mkTransition(100))
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0);

    nodes.merge(newNodes)
        .select("text")
        .attr("dx", d => d.x0 + 10)
        .attr("dy", d => d.y0 + 16)
        .text(d => d.data.name + (d.prunedChildren ? "..." : ""))

    nodes.exit()
        .remove();
}
