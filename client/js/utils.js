import {extent, pairs} from "d3-array";
import {scaleBand, scaleOrdinal, scaleTime, schemeCategory20c} from "d3-scale";


export function randomPick(xs) {
    if (!xs) {
        throw new Error("Cannot pick from a null set of options");
    }

    const choiceCount = xs.length - 1;
    const idx = Math.round(Math.random() * choiceCount);
    return xs[idx];
}


export function getRandomDate(from, to) {
    const fromTime = from.getTime();
    const toTime = to.getTime();
    return new Date(fromTime + Math.random() * (toTime - fromTime));
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


/**
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 * @param flatness (higher = flatter, defaults to 3)
 * @returns {string}
 */
export function mkCurvedLine(x1, y1, x2, y2, flatness = 3) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dr = Math.sqrt(dx * dx + dy * dy);

    return `M${x2} ${y2}
            A${dr * flatness},${dr * flatness} 0 0,1 ${x1},${y1}`;
}
