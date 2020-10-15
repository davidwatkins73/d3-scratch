import '../styles/index.scss';
import {categories, data} from "./data";
import {draw} from "./viz";

const redrawFn = draw("#viz", data, categories);

document.getElementById("y2022").onclick = () => redrawFn(_.filter(data, d => d.app.size > 5));
document.getElementById("y2024").onclick = () => redrawFn(_.filter(data, d => d.app.size > 10));
document.getElementById("y2020").onclick = () => redrawFn(data);