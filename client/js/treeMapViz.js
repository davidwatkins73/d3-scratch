import {focus, mkTransition} from "./commonViz";


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
        .transition(mkTransition(100))
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
