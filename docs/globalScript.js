// This stuff should be global
const allSkills = {
    swordSlash: {
        name: 'Sword Slash',
        target: 'choose-enemy',
        dmgmod: [1.2],
        healmod: [],
        acc: 1,
        cd: 0,
    },
    doubleSlash: {
        name: 'Double Slash',
        target: 'choose-enemy',
        dmgmod: [.9, .9],
        healmod: [],
        acc: .9,
        cd: 2,
    },
    smiteNovice: {
        name: 'Smite (Novice)',
        target: 'choose-enemy',
        dmgmod: [.5],
        healmod: [],
        acc: .5,
        cd: 2,
    },
    fireblast: {
        name: 'Fireblast',
        target: 'choose-enemy',
        dmgmod: [2],
        healmod: [],
        acc: 1,
        cd: 0,
    },
    rainOfFire: {
        name: 'Rain of Fire',
        target: 'all-enemy',
        dmgmod: [1.2],
        healmod: [],
        acc: 1,
        cd: 5
    },
    smallHeal: {
        name: 'Small heal',
        target: 'choose-friendly',
        dmgmod: [],
        healmod: [.75],
        acc: 1,
        cd: 0,
    },
    largeHeal: {
        name: 'Large heal',
        target: 'choose-friendly',
        dmgmod: [],
        healmod: [2.5],
        acc: 1,
        cd: 3,
    },
};
const allEnemies = {
    orcWarrior: {
        name: 'Orc Warrior',
        maxhp: 500,
        hp: 500,
        def: .2,
        atk: 90,
        heal: 0,
        acc: .9,
        abilities: [
            allSkills.swordSlash,
            allSkills.doubleSlash,
        ]
    },
    orcShaman: {
        name: 'Orc Shaman',
        maxhp: 400,
        hp: 400,
        def: .1,
        atk: 100,
        heal: 0,
        acc: 1,
        abilities: [
            allSkills.rainOfFire,
            allSkills.fireblast,
        ]
    },
};
function getEnemy(name, abilities) {
    const enemy = {
        ... allEnemies[name] || Object.values(allEnemies).find((e) => e.name === name),
    };
    // Dont use default abilities if custom ones were included
    if (abilities)  {
        enemy.abilities = abilities.map((a) => ({ ... a }));
    }
    // Set current cooldown for each ability  to 0
    enemy.abilities.forEach((a) => {
        a.curcd = 0;
    });
    return enemy;
}

const party = [
    {
        name: 'Tali',
        maxhp: 300,
        hp: 300,
        def: 0,
        atk: 30,
        heal: 130,
        acc: .6,
        isPlayable: true,
        abilities: [
            { ... allSkills.smallHeal, curcd: 0 },
            { ... allSkills.largeHeal, curcd: 0 },
            { ... allSkills.smiteNovice, curcd: 0 },
        ],
    },
    {
        name: 'Felix',
        maxhp: 400,
        hp: 400,
        def: .2,
        atk: 60,
        heal: 0,
        acc: .9,
        abilities: [
            { ... allSkills.doubleSlash, curcd: 0 },
            { ... allSkills.swordSlash, curcd: 0 },
        ],
    },
    {
        name: 'Brindall',
        maxhp: 600,
        hp: 600,
        def: .35,
        atk: 100,
        heal: 10,
        acc: .6,
        abilities: [
            { ... allSkills.doubleSlash, curcd: 0 },
            { ... allSkills.swordSlash, curcd: 0 },
        ],
    },
    {
        name: 'Clax',
        maxhp: 350,
        hp: 350,
        def: .1,
        atk: 120,
        heal: 5,
        acc: .9,
        abilities: [
            { ... allSkills.doubleSlash, curcd: 0 },
            { ... allSkills.swordSlash, curcd: 0 },
        ],
    },
];