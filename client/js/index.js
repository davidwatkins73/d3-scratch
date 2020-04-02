import '../styles/index.scss';
import * as d3 from "d3";

const testDataStr = `
    a 
    b ba bb bc bca bcb bcc bd
    c ca cb cba cbaa cbab cbaba cbb cc cd cda cdb cdccdca cdcb
    d da dab dac db dba dbb dbc dbd dbda dbdb dbdba
    e ea eab eac eaca eb ec ed ee eea
    f fa fab
`;


function getParentId(idMap = {}, d = "") {
    return d.length <= 1
        ? null
        : idMap[d.substr(0, d.length - 1)] || null;
}

function mkData(dataStr) {
    const atoms = dataStr.split(/\s+/).filter(atom => atom !== "");

    let id = 1;
    const idMap = {root: 0};
    atoms.forEach(d => idMap[d] = id++);

    return [{id: 0, name: "Root"}]
        .concat(atoms
            .map(atom => {
                const id = idMap[atom];
                const pId = getParentId(idMap, atom) || 0;
                return {
                    id,
                    parentId: pId,
                    name: atom
                };
            }));
}

const data = mkData(testDataStr);

const hierData = d3.stratify()(data);

let treeRoot = d3
    .tree()
    .size([500, 400])
    (hierData);

const svg = d3
    .select("#viz")
    .append("svg")
    .attr("width", "600px")
    .attr("height", "600px");

const g = svg
    .append("g")
    .attr("transform", "translate(50 50)");

g.selectAll("circle")
    .data(treeRoot.descendants())
    .enter()
    .append("circle")
    .attr("r", d => 10 - d.depth)
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("stroke", "red")
    .attr("fill", "pink")
    ;

g.selectAll("line")
    .data(treeRoot.descendants())
    .enter()
    .filter(d => d.parent !== null)
    .append("line")
    .attr("x1", d => d.parent.x)
    .attr("x2", d => d.x)
    .attr("y1", d => d.parent.y)
    .attr("y2", d => d.y)
    .attr("stroke", "purple")
    ;



console.log({data, hierData, treeRoot});
