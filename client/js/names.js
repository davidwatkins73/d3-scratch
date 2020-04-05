import _ from "lodash";

const names = [
    "Alpine",
    "Anxious",
    "Badger",
    "Bagpipe",
    "Balboa",
    "Bear",
    "Bee",
    "Bird",
    "Biscuit",
    "Brave",
    "Brief",
    "Bright",
    "Broken",
    "Bruised",
    "Bulldog",
    "Busy",
    "Calm",
    "Caravan",
    "Carbine",
    "Castle",
    "Chariot",
    "Cobra",
    "Common",
    "Dangerous",
    "Deaf",
    "Defiant",
    "Demon",
    "Dessert",
    "Dirty",
    "Dragon",
    "Dragonfly",
    "Dual",
    "Dynamo",
    "Eager",
    "Eclipse",
    "Falcon",
    "Flat",
    "Foxtail",
    "Fresh",
    "Frostbite",
    "Frugal",
    "Fuzzy",
    "General",
    "Grave",
    "Grim",
    "Hairy",
    "Hammer",
    "Hercules",
    "Hoarse",
    "Honored",
    "Humble",
    "Icky",
    "Jolly",
    "Light",
    "Lightfoot",
    "Lone",
    "Lucky",
    "Lyric",
    "Mad",
    "Major",
    "Mamba",
    "Mercury",
    "Orange",
    "Passenger",
    "Petty",
    "Pirate",
    "Polite",
    "Queen",
    "Red",
    "Rose",
    "Sandstorm",
    "Sherpa",
    "Snow",
    "Stinger",
    "Sunburn",
    "Tailor",
    "Templer",
    "Tense",
    "Titan",
    "Tsunami",
    "Tuner",
    "Volcano",
    "Warrior",
    "Weeping",
    "Whisper",
    "White",
    "Willow",
    "Zion"
];

export function mkName(parts = 2) {
    return _.range(0, parts)
        .map(() => {
            const idx = Math.floor(Math.random() * names.length)
            return names[idx];
        })
        .join(" ");
}