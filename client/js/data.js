import {mkName} from "./names";


export const categories = {
    c1: {
        id: 1,
        name: "Lift & Shift",
        position: 1
    },
    c2: {
        id: 2,
        name: "Refactor",
        position: 2
    },
    c3: {
        id: 3,
        name: "Hard Refactor",
        position: 3
    },
    c4: {
        id: 4,
        name: "Replatform",
        position: 4
    },

};


function getRandomDate(from, to) {
    from = from.getTime();
    to = to.getTime();
    return new Date(from + Math.random() * (to - from));
}


function mkDate(phase) {
    return getRandomDate(phase.start, phase.end);
}


const phases = {
    p1: {
        start: new Date(2020, 10),
        end: new Date(2021, 3),
    },
    p2: {
        start: new Date(2021, 2),
        end: new Date(2022, 7),
    }
};


function mkAppData() {
    return  {
        name: mkName(2),
        milestones: [
            {
                rank: 1,
                name: "init",
                date: mkDate(phases.p1),
                category: categories.c1
            }, {
                rank: 1,
                name: "init",
                date: mkDate(phases.p2),
                category: categories.c2
            }
        ]
    };
}


export const data = [
    mkAppData(),
    mkAppData(),
    mkAppData(),
    mkAppData()
];

