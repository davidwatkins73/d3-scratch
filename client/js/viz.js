import {select} from "d3-selection";
import {mkArcData, mkNodeData} from "./utils";
import {scaleBand, scaleOrdinal, scaleTime, schemeCategory20c} from "d3-scale";
import {extent} from "d3-array";
import {axisBottom, axisLeft} from "d3-axis";
import {timeFormat} from "d3-time-format";

// viz

const margins = {
    top: 30,
    left: 80,
    right: 10,
    bottom: 50
};

const dimensions = {
    w: 1000,
    h: 800
};


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
        .attr("width", dimensions.w)
        .attr("height", dimensions.h);

    const graph = svg
        .append("g")
        .attr("transform", `translate(${margins.left}, ${margins.top})`);

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


function mkScaleY(categories = []) {
    const orderedCategories = _
        .chain(categories)
        .orderBy(d => d.position * -1)
        .value();

    return scaleBand()
        .domain(_.map(
            orderedCategories,
            d => d.id))
        .range([0, dimensions.h - (margins.top + margins.bottom)]);
}


function mkScaleX(nodeData) {
    const dateExtent = extent(
        nodeData,
        d => d.milestone.date);

    return scaleTime()
        .domain(dateExtent)
        .range([0, dimensions.w - (margins.left + margins.right)])
        .nice();
}


 function mkScales(nodeData,
                         categories) {
    return {
        x: mkScaleX(nodeData),
        y: mkScaleY(categories),
        color: scaleOrdinal(schemeCategory20c)
    };
}


function drawAxes(scales,
                         svg,
                         categories) {
    const categoriesById = _.keyBy(
        categories,
        d => d.id);

    svg.append("g")
        .attr("transform", `translate(${margins.left} ${dimensions.h - (margins.bottom)})`)
        .call(axisBottom(scales.x)
            .tickFormat(timeFormat("%d %b %Y"))
            .ticks(6));

    svg.append("g")
        .attr("transform", `translate(${margins.left} ${margins.top})`)
        .call(axisLeft(scales.y)
            .tickFormat(d => categoriesById[d].name));
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
