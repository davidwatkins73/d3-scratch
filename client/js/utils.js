import {extent, pairs} from "d3-array";
import {scaleBand, scaleOrdinal, scaleTime, schemeCategory20c} from "d3-scale";
import {axisBottom, axisLeft} from "d3-axis";
import {timeFormat} from "d3-time-format";


export function randomPick(xs) {
    if (!xs) throw new Error("Cannot pick from a null set of options");

    const choiceCount = xs.length - 1;
    const idx = Math.round(Math.random() * choiceCount);
    return xs[idx];
}


export function getRandomDate(from, to) {
    from = from.getTime();
    to = to.getTime();
    return new Date(from + Math.random() * (to - from));
}


export function mkNodeData(data = []) {
    return _.flatMap(
        data,
        d => _.map(
            d.milestones,
            m => ({app: d.app, milestone: m})));
}


export function mkArcData(data = []) {
    return _.flatMap(
        data,
        d => pairs(
            d.milestones,
            (m1, m2) => ({app: d.app, m1, m2})));
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
        .range([0, 540]);
}


function mkScaleX(nodeData) {
    const dateExtent = extent(
        nodeData,
        d => d.milestone.date);
    return scaleTime()
        .domain(dateExtent)
        .range([0, 780])
        .nice();
}


export function drawAxes(scales,
                         svg,
                         categories) {
    const categoriesById = _.keyBy(
        categories,
        d => d.id);

    svg.append("g")
        .attr("transform", "translate(80 570)")
        .call(axisBottom(scales.x)
            .tickFormat(timeFormat("%d %b %Y"))
            .ticks(6));

    svg.append("g")
        .attr("transform", "translate(80 30)")
        .call(axisLeft(scales.y)
            .tickFormat(d => categoriesById[d].name));
}


export function mkScales(nodeData,
                         categories) {
    return {
        x: mkScaleX(nodeData),
        y: mkScaleY(categories),
        color: scaleOrdinal(schemeCategory20c)
    };
}

