import {select} from "d3-selection";
import {drawAxes, mkArcData, mkNodeData, mkScales} from "./utils";

// viz

function drawApps(scales, elem, nodeData = []) {
    const apps = elem
        .selectAll("circle.app")
        .data(nodeData, d => d.milestone.id);

    const newApps = apps
        .enter()
        .append("circle")
        .classed("app", true)
        .attr("fill", d => scales.color(d.app.id))
        .attr("stroke", d => scales.color(d.app.id))
        .on("mouseover", d => console.log(d.app.name, d.milestone.category.name));

    apps.merge(newApps)
        .attr("r", d => d.app.size)
        .attr("cx", d => scales.x(d.milestone.date))
        .attr("cy", d => scales.y(d.milestone.category.id) + scales.y.bandwidth() / 2);

    apps.exit()
        .remove();
}


function drawArcs(scales, elem, arcData = []) {
    const arcs = elem
        .selectAll("line.arc")
        .data(arcData, d => `${d.m1.id}_${d.m2.id}`);

    const newArcs = arcs
        .enter()
        .append("line")
        .classed("arc", true);

    arcs.merge(newArcs)
        .attr("x1", d => scales.x(d.m1.date))
        .attr("x2", d => scales.x(d.m2.date))
        .attr("y1", d => scales.y(d.m1.category.id) + scales.y.bandwidth() / 2)
        .attr("y2", d => scales.y(d.m2.category.id) + scales.y.bandwidth() / 2);

    arcs.exit()
        .remove();
}


function setupContainers(elemSelector = '#viz') {
    const svg = select(elemSelector)
        .append("svg")
        .attr("width", 900)
        .attr("height", 600);

    const graph = svg
        .append("g")
        .attr("transform", "translate(80, 30)");

    const arcs = graph
        .append("g")
        .classed("arcs", true);

    const apps = graph
        .append("g")
        .classed("apps", true);

    return {
        svg,
        arcs,
        apps
    };
}


function prepareData(rawData, categories) {
    const nodeData = mkNodeData(rawData);
    const arcData = mkArcData(rawData);
    return {nodeData, arcData, categories};
}


export function draw(elemSelector,
                      rawData = [],
                      categories = []) {

    const data = prepareData(rawData, categories);
    const scales = mkScales(data.nodeData, categories);
    const containers = setupContainers(elemSelector);

    drawAxes(scales, containers.svg, categories);

    const redraw = (updatedRawData) => {
        const updatedData = prepareData(updatedRawData, categories);
        drawApps(scales, containers.apps, updatedData.nodeData);
        drawArcs(scales, containers.arcs, updatedData.arcData);
    };

    redraw(rawData);

    return redraw;
}
