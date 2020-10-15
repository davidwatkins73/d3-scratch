import '../styles/index.scss';
import {select} from "d3-selection";
import {categories, data} from "./data";
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
        .on("mouseover", d => console.log(d.milestone.category.name, d.milestone.date))

    apps.merge(newApps)
        .attr("r", d => d.app.size)
        .attr("cx", d => scales.x(d.milestone.date))
        .attr("cy", d => scales.y(d.milestone.category.id) + scales.y.bandwidth() / 2)
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
}


function setupContainers() {
    const svg = select("#viz")
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

function draw(data = [],
              categories = []) {

    const nodeData = mkNodeData(data);
    const arcData = mkArcData(data);
    console.log({nodeData, arcData, data, categories})


    const scales = mkScales(nodeData, categories);
    const containers = setupContainers();


    drawAxes(scales, containers.svg, categories);
    drawApps(scales, containers.apps, nodeData);
    drawArcs(scales, containers.arcs, arcData);
}

draw(data, categories);