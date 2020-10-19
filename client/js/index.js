import '../styles/index.scss';
import {categories, data} from "./data";
import {draw} from "./viz";

const redrawFn = draw("#viz", data, categories);

document.getElementById("y2022").onclick = () => redrawFn(d => d.app.size > 6);
document.getElementById("y2024").onclick = () => redrawFn(d => d.app.size > 9);
document.getElementById("y2020").onclick = () => redrawFn();