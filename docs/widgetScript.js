// This stuff is specific for this fight
const enemies = [
    getEnemy('orcShaman'),
    getEnemy('orcShaman'),
    getEnemy('orcWarrior'),
    getEnemy('orcWarrior'),
];

window.showCombatScreen('#app', './Forest4.png', party, enemies, (victory) => {
    console.log('Did your party win', victory);
});