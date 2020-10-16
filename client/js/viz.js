import {select} from "d3-selection";
import {mkArcData, mkCurvedLine, mkNodeData} from "./utils";
import {scaleBand, scaleLinear, scaleOrdinal, scaleTime, schemeCategory20c} from "d3-scale";
import {extent} from "d3-array";
import {axisBottom, axisLeft} from "d3-axis";
import {timeFormat} from "d3-time-format";
import {easeLinear} from "d3-ease";
import {transition} from "d3-transition";

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

    const allApps = apps
        .merge(newApps)
        .attr("r", d => scales.appSize(d.app.size))
        .attr("cx", d => scales.x(d.milestone.date))
        .attr("cy", d => scales.y(d.milestone.category.id) + scales.y.bandwidth() / 2);

    apps.exit()
        .remove();

    return allApps;
}


function drawArcs(scales, elem, arcData = []) {
    const arcs = elem
        .selectAll("path.arc")
        .data(arcData, d => `${d.m1.id}_${d.m2.id}`);

    const newArcs = arcs
        .enter()
        .append("path")
        .classed("arc", true)
        .attr("fill", "none")
        .attr("stroke", colors.arc.normal)

    const allArcs = arcs
        .merge(newArcs)
        .attr("d", d => mkCurvedLine(
            scales.x(d.m1.date),
            scales.y(d.m1.category.id) + scales.y.bandwidth() / 2,
            scales.x(d.m2.date),
            scales.y(d.m2.category.id) + scales.y.bandwidth() / 2,
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



function mkScaleAppSize(nodeData) {
    const sizeExtent = extent(
        nodeData,
        d => d.app.size);

    return scaleLinear()
        .domain(sizeExtent)
        .range([MIN_NODE_SIZE, MAX_NODE_SIZE]);
}


 function mkScales(nodeData,
                   categories) {
    return {
        x: mkScaleX(nodeData),
        y: mkScaleY(categories),
        appSize: mkScaleAppSize(nodeData),
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
    return {
        nodeData,
        arcData,
        categories
    };
}


export function draw(elemSelector,
                      rawData = [],
                      categories = []) {

    const data = prepareData(rawData, categories);
    const scales = mkScales(data.nodeData, categories);
    const containers = setupContainers(elemSelector);

    drawAxes(scales, containers.svg, categories);

    const redraw = (updatedRawData = rawData) => {
        const updatedData = prepareData(updatedRawData, categories);
        const allApps = drawApps(scales, containers.apps, updatedData.nodeData, redraw);
        const allArcs = drawArcs(scales, containers.arcs, updatedData.arcData, redraw);

        console.log({updatedData})
        allApps
            .on("mouseover.debug", (d) => { console.log(d.app.name, d.milestone.date)})
            .on("mouseover.highlight", function(d) {
                allApps
                    .transition(transition()
                        .ease(easeLinear)
                        .duration(ANIMATION_DURATION))
                    .style("opacity", x => (x.app.id === d.app.id) ? 1 : 0.2)
                    .attr("stroke-width", x => (x.app.id === d.app.id) ? 2 : 1);

                allArcs
                    .transition(transition()
                        .ease(easeLinear)
                        .duration(ANIMATION_DURATION))
                    .style("opacity", x => x.app.id === d.app.id ? 1 : 0.2 )
                    .attr("stroke", x => x.app.id === d.app.id ? colors.arc.highlight : colors.arc.normal)
                    .attr("stroke-width", x => x.app.id === d.app.id ? 2 : 1);
            })
            .on("mouseleave.removeHighlight", function(d) {
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
            });
    };

    redraw(rawData);

    return redraw;
}
