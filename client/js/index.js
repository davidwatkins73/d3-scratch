import '../styles/index.scss';
import {categories, data} from "./data";
import {draw} from "./viz";

const redrawFn = draw("#viz", data, categories);

let filterFn = () => true;
let dynPropFn = () => {};

function redraw() {
    redrawFn(filterFn, dynPropFn);
}

document.getElementById("y2022").onclick = () => {
    filterFn = d => d.app.size > 6;
    redraw();
};

document.getElementById("y2024").onclick = () => {
    filterFn = d => d.app.size > 9;
    redraw();
};

document.getElementById("y2020").onclick = () => {
    filterFn = () => true;
    redraw();
};

document.getElementById("kill").onclick = () => {
    dynPropFn = d => ({isRemoved: d.app.name.startsWith("p")});
    redraw();
};

document.getElementById("clear").onclick = () => {
    dynPropFn = d => ({});
    redraw();
};


