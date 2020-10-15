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

