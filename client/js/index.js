import '../styles/index.scss';
import * as d3 from "d3";


console.log('webpack starterkit');

console.log(d3)


const svg = d3
    .select("#viz")
    .append("svg");


const data = [10, 40, 34, 10, 9];


svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("r", d => d / 2)
    .attr("cx", (d, i) => (i + 1)  * 30)
    .attr("cy", 100)
    .attr("stroke", "red")
    .attr("fill", "pink");