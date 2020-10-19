import {mouse, select} from "d3-selection";
import {scaleBand, scaleLinear, scaleOrdinal, scaleTime, schemeCategory20c} from "d3-scale";
import {extent} from "d3-array";
import {axisBottom, axisLeft} from "d3-axis";
import {timeFormat} from "d3-time-format";
import {easeLinear} from "d3-ease";
import {transition} from "d3-transition";
import {mkArcData, mkCurvedLine, mkNodeData} from "./utils";

// viz
const ANIMATION_DURATION = 100;
const MAX_NODE_SIZE = 10;
const MIN_NODE_SIZE = 2;

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

const colors = {
    arc: {
        highlight: "#d65050",
        normal: "#eee"
    }
};


function showTooltip(tooltip, d, mx, my) {
    tooltip
        .html(`<h5>${d.app.name}</h5>`)
        .style("left", (mx + 70) + "px")
        .style("top", (my - 2) + "px")
        .transition(transition()
            .ease(easeLinear)
            .duration(ANIMATION_DURATION * 2))
        .style("opacity", 1);
}


function hideTooltip(tooltip) {
    tooltip
        .transition(transition()
            .ease(easeLinear)
            .duration(ANIMATION_DURATION * 2))
        .style("opacity", 0);
}


function drawApps(scales, elem, nodeData = []) {
    const apps = elem
        .selectAll("circle.app")
        .data(nodeData, d => d.milestone.id);

    const newApps = apps
        .enter()
        .append("circle")
        .classed("app", true)
        .attr("fill", d => scales.color(d.app.id))
        .attr("stroke", d => scales.color(d.app.id));

    apps.exit()
        .remove();

    const allApps = apps
        .merge(newApps)
        .attr("r", d => scales.appSize(d.app.size))
        .attr("cx", d => scales.x(d.milestone.date))
        .attr("cy", d => d.y + scales.y.bandwidth() / 2);

    return allApps;
}


function drawArcs(scales, elem, arcData = []) {
    console.log({arcData, elem, scales});
    const arcs = elem
        .selectAll("path.arc")
        .data(arcData, d => d.id);

    const newArcs = arcs
        .enter()
        .append("path")
        .classed("arc", true)
        .attr("fill", "none")
        .attr("stroke", colors.arc.normal)

    const allArcs = arcs
        .merge(newArcs)
        .attr("d", d => console.log(d) || mkCurvedLine(
            scales.x(d.m1.date),
            d.y1 + scales.y.bandwidth() / 2,
            scales.x(d.m2.date),
            d.y2 + scales.y.bandwidth() / 2,
            2
        ));

    arcs.exit()
        .remove();

    return allArcs;
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

    const tooltip = select(elemSelector)
        .append("div")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")

    return {
        svg,
        arcs,
        apps,
        tooltip
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


function mkScaleX(data) {
    const dateExtent = extent(_.flatMap(
        data,
        d => _.map(d.milestones, m => m.date)));

    return scaleTime()
        .domain(dateExtent)
        .range([0, dimensions.w - (margins.left + margins.right)])
        .nice();
}


function mkScaleAppSize(data) {
    const sizeExtent = extent(
        data,
        d => d.app.size);

    return scaleLinear()
        .domain(sizeExtent)
        .range([MIN_NODE_SIZE, MAX_NODE_SIZE]);
}


 function mkScales(rawData,
                   categories) {
    return {
        x: mkScaleX(rawData),
        y: mkScaleY(categories),
        appSize: mkScaleAppSize(rawData),
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


function prepareData(scales, rawData, categories) {
    const nodeData = mkNodeData(scales, rawData);
    const arcData = mkArcData(nodeData);
    return {
        rawData,
        nodeData,
        arcData,
        categories
    };
}


function highlightAppsAndArcs(allApps, allArcs, node) {
    allApps
        .transition(transition()
            .ease(easeLinear)
            .duration(ANIMATION_DURATION))
        .style("opacity", x => (x.app.id === node.app.id) ? 1 : 0.2)
        .attr("stroke-width", x => (x.app.id === node.app.id) ? 2 : 1);

    allArcs
        .transition(transition()
            .ease(easeLinear)
            .duration(ANIMATION_DURATION))
        .style("opacity", x => x.app.id === node.app.id ? 1 : 0.2)
        .attr("stroke", x => x.app.id === node.app.id ? colors.arc.highlight : colors.arc.normal)
        .attr("stroke-width", x => x.app.id === node.app.id ? 2 : 1);
}


function removeHighlights(allApps, allArcs) {
    allApps
        .transition(transition()
            .ease(easeLinear)
            .duration(ANIMATION_DURATION))
        .style("opacity", 1)
        .attr("stroke-width", 1);
    allArcs
        .transition(transition()
            .ease(easeLinear)
            .duration(ANIMATION_DURATION))
        .style("opacity", 1)
        .attr("stroke", colors.arc.normal)
        .attr("stroke-width", 1);
}


function setupInteractivity(allApps, allArcs, containers) {
    allApps
        .on("mouseover.debug", (d) => console.log(
            d.milestone.date,
            d.app.name,
            d.milestone.category.name))
        .on("mouseover.highlight", (d) => highlightAppsAndArcs(allApps, allArcs, d))
        .on("mouseleave.removeHighlight", () => removeHighlights(allApps, allArcs))
        .on("mouseover.popover", function (d) {
            const m = mouse(this);
            showTooltip(containers.tooltip, d, m[0], m[1]);
        })
        .on("mouseleave.popover", () => hideTooltip(containers.tooltip));
}


export function draw(elemSelector,
                     rawData = [],
                     categories = []) {
    const scales = mkScales(rawData, categories);
    const containers = setupContainers(elemSelector);

    drawAxes(scales, containers.svg, categories);

    const redraw = (updatedRawData = rawData) => {
        const updatedData = prepareData(scales, updatedRawData, categories);
        const allApps = drawApps(scales, containers.apps, updatedData.nodeData, redraw);
        const allArcs = drawArcs(scales, containers.arcs, updatedData.arcData, redraw);
        setupInteractivity(allApps, allArcs, containers);
    };

    redraw(rawData);

    return redraw;
}
