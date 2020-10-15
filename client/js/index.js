import '../styles/index.scss';
import {select} from "d3-selection";
import {scaleBand, scalePoint, scaleTime} from "d3-scale";
import {axisBottom, axisLeft, axisRight, axisTop} from "d3-axis";
import {timeFormat} from "d3-time-format";
import {extent, max} from "d3-array";
import {data, categories} from "./data";

console.log('webpack starterkit', {data});

const svg = select("#viz")
    .append("svg")
    .attr("width", 900)
    .attr("height", 600);


const dateExtent = extent(
    data,
    d => max(d.milestones, d => d.date));



const yValues = _
    .chain(categories)
    .orderBy(d => d.position * -1)
    .value();

console.log({yValues})

const y = scaleBand()
    .domain(_.map(yValues, d => d.name))
    .range([0, 540]);


const x = scaleTime()
    .domain(dateExtent)
    .range([0, 780])
    .nice();


svg.append("g")
    .attr("transform", "translate(80 570)")
    .call(axisBottom(x)
        .tickFormat(timeFormat("%d %b %Y"))
        .ticks(6));

svg.append("g")
    .attr("transform", "translate(80 30)")
    .call(axisLeft(y));


console.log({data, categories})

svg.append("g")
    .classed()
