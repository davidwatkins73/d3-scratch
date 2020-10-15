import '../styles/index.scss';
import {select} from "d3-selection";
import {scaleBand, scaleOrdinal, scalePoint, scaleTime, schemeCategory20c} from "d3-scale";
import {axisBottom, axisLeft, axisRight, axisTop} from "d3-axis";
import {timeFormat} from "d3-time-format";
import {extent, max, pairs} from "d3-array";
import {data, categories} from "./data";


const flatData = _.flatMap(data, d => _.map(d.milestones, m => ({app: d.app, milestone: m})));
const arcData = _.flatMap(data, d => pairs(d.milestones, (m1, m2) => ({app: d.app, m1, m2})));


console.log({flatData, arcData, data, categories})

const dateExtent = extent(
    flatData,
    d => d.milestone.date);

const categoriesById = _.keyBy(
    categories,
    d => d.id);

const orderedCategories = _
    .chain(categories)
    .orderBy(d => d.position * -1)
    .value();


const svg = select("#viz")
    .append("svg")
    .attr("width", 900)
    .attr("height", 600);

const y = scaleBand()
    .domain(_.map(orderedCategories, d => d.id))
    .range([0, 540]);

const x = scaleTime()
    .domain(dateExtent)
    .range([0, 780])
    .nice();


const randomColorScale = scaleOrdinal(schemeCategory20c);

svg.append("g")
    .attr("transform", "translate(80 570)")
    .call(axisBottom(x)
        .tickFormat(timeFormat("%d %b %Y"))
        .ticks(6));

svg.append("g")
    .attr("transform", "translate(80 30)")
    .call(axisLeft(y)
        .tickFormat(d => categoriesById[d].name));

const graph = svg
    .append("g")
    .attr("transform", "translate(80, 30)");


const arcsG = graph
    .append("g")
    .classed("arcs", true);

const appsG = graph
    .append("g")
    .classed("apps", true);

const apps = appsG
    .selectAll("circle.app")
    .data(flatData, d => d.milestone.id);

const arcs = arcsG
    .selectAll("line.arc")
    .data(arcData, d => `${d.m1.id}_${d.m2.id}`);


apps.enter()
    .append("circle")
    .classed("app", true)
    .attr("fill", d => randomColorScale(d.app.id))
    .attr("stroke", d => randomColorScale(d.app.id))
    .attr("r", d => d.app.size)
    .attr("cx", d => x(d.milestone.date))
    .attr("cy", d => y(d.milestone.category.id) + y.bandwidth() / 2)
    .on("mouseover", d => console.log(d.milestone.category.name, d.milestone.date))

arcs.enter()
    .append("line")
    .classed("arc", true)
    .attr("x1", d => x(d.m1.date))
    .attr("x2", d => x(d.m2.date))
    .attr("y1", d => y(d.m1.category.id) + y.bandwidth() / 2)
    .attr("y2", d => y(d.m2.category.id) + y.bandwidth() / 2);

