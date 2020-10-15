import {mkName} from "./names";
import {getRandomDate, randomPick} from "./utils";

let ctr = 0;

function mkDate(phase) {
    return getRandomDate(phase.start, phase.end);
}


export const categories = {
    liftAndShift: {
        id: ctr++,
        name: "Lift & Shift",
        position: 1
    },
    easyRefactor: {
        id: ctr++,
        name: "Refactor",
        position: 2
    },
    hardRefactor: {
        id: ctr++,
        name: "Hard Refactor",
        position: 3
    },
    replatform: {
        id: ctr++,
        name: "Replatform",
        position: 4
    },

};


const phases = {
    p1: {
        start: new Date(2020, 10),
        end: new Date(2021, 3),
    },
    p2: {
        start: new Date(2021, 2),
        end: new Date(2022, 7),
    },
    p3: {
        start: new Date(2021, 7),
        end: new Date(2024, 7),
    }
};

const liftAndShift = (phase) => ({
    id: ctr++,
    name: "drop in",
    date: mkDate(phase),
    category: categories.liftAndShift
});

const easyRefactor = (phase) => ({
    id: ctr++,
    name: "moderate modifications",
    date: mkDate(phase),
    category: categories.easyRefactor
});

const hardRefactor = (phase) => ({
    id: ctr++,
    name: "refactor hard",
    date: mkDate(phase),
    category: categories.hardRefactor
});

const replatform = (phase) => ({
    id: ctr++,
    name: "rewrite",
    date: mkDate(phase),
    category: categories.replatform
});


const examplePaths = [
    () => [ liftAndShift(phases.p1) ],
    () => [ liftAndShift(phases.p2) ],
    () => [ liftAndShift(phases.p1), hardRefactor(phases.p2) ],
    () => [ liftAndShift(phases.p2), hardRefactor(phases.p3) ],
    () => [ liftAndShift(phases.p1), easyRefactor(phases.p2) ],
    () => [ liftAndShift(phases.p1), replatform(phases.p3) ],
    () => [ easyRefactor(phases.p2), replatform(phases.p3) ],
    () => [ easyRefactor(phases.p1), hardRefactor(phases.p2), replatform(phases.p3) ],
    () => [ replatform(phases.p2) ],
    () => [ replatform(phases.p3) ]
];


function mkAppData() {
    return {
        app: {
            name: mkName(2),
            id: ctr++,
            size: Math.ceil(Math.random() * 12)
        },
        milestones: randomPick(examplePaths)()
    };
}


export const data = _.map(_.range(200), d => mkAppData());


