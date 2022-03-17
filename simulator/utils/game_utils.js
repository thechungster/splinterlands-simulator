"use strict";
exports.__esModule = true;
exports.getSuccessBelow = exports.monsterTurnComparator = exports.getDidDodge = void 0;
var types_1 = require("../types");
var ability_utils_1 = require("./ability_utils");
function getDidDodge(rulesets, attackingMonster, attackTarget, attackType) {
    if (attackType === types_1.AttackType.MAGIC &&
        !attackTarget.hasAbility(types_1.Ability.PHASE)) {
        return false;
    }
    if (attackingMonster.hasAbility(types_1.Ability.TRUE_STRIKE)) {
        return false;
    }
    var speedDifference = attackTarget.getPostAbilitySpeed() - attackingMonster.getPostAbilitySpeed();
    if (rulesets.has(types_1.Ruleset.REVERSE_SPEED)) {
        speedDifference *= -1;
    }
    var dodgeChance = speedDifference > 0 ? speedDifference * SPEED_DODGE_CHANCE : 0;
    // _ 25% for Dodge
    if (attackTarget.hasAbility(types_1.Ability.DODGE)) {
        dodgeChance += ability_utils_1.DODGE_CHANCE;
    }
    // +25% for Flying with no snare
    if (attackTarget.hasAbility(types_1.Ability.FLYING) &&
        !attackingMonster.hasAbility(types_1.Ability.FLYING) &&
        !attackingMonster.hasAbility(types_1.Ability.SNARE) &&
        !attackTarget.hasDebuff(types_1.Ability.SNARE)) {
        dodgeChance += ability_utils_1.FLYING_DODGE_CHANCE;
    }
    // + 15% if attacker has blind
    if (attackingMonster.hasDebuff(types_1.Ability.BLIND)) {
        dodgeChance += ability_utils_1.BLIND_DODGE_CHANCE;
    }
    return getSuccessBelow(dodgeChance * 100);
}
exports.getDidDodge = getDidDodge;
function monsterTurnComparator(monster1, monster2) {
    var normalCompareDiff = normalCompare(monster1, monster2);
    // Descending order
    if (normalCompareDiff !== 0) {
        return normalCompareDiff;
    }
    // Resolve ties by order if same team, else randomly
    // TODO(bug): This doesn't seem right. Why does monster 1 go first if it doesn't have attack
    if (!monster1.hasAttack() &&
        monster1.getTeamNumber() === monster2.getTeamNumber()) {
        return 1;
    }
    else if (!monster2.hasAttack() &&
        monster1.getTeamNumber() === monster2.getTeamNumber()) {
        return -1;
    }
    // If same team and back line monsters don't have opportunity or sneak or reach, front goes first
    if (monster1.getTeamNumber() === monster2.getTeamNumber()) {
        return resolveFriendlyTies(monster1, monster2);
    }
    else {
        return randomTieBreaker();
    }
}
exports.monsterTurnComparator = monsterTurnComparator;
function getSuccessBelow(chance) {
    return Math.floor(Math.random() * 101) < chance;
}
exports.getSuccessBelow = getSuccessBelow;
var SPEED_DODGE_CHANCE = 0.1;
function normalCompare(monster1, monster2) {
    var speedDiff = monster1.getPostAbilitySpeed() - monster2.getPostAbilitySpeed();
    if (speedDiff !== 0) {
        return speedDiff;
    }
    if (monster1.magic > 0 && monster2.magic === 0) {
        return 1;
    }
    if (monster2.magic > 0 && monster1.magic === 0) {
        return -1;
    }
    if (monster1.ranged > 0 && monster2.ranged === 0) {
        return 1;
    }
    if (monster2.ranged > 0 && monster1.ranged === 0) {
        return -1;
    }
    return monster1.getRarity() - monster2.getRarity();
}
function resolveFriendlyTies(monster1, monster2) {
    var monster1Position = monster1.getCardPosition();
    var monster2Position = monster2.getCardPosition();
    if (!monster1.hasAction() && !monster2.hasAction()) {
        return monster1Position < monster2Position ? -1 : 1;
    }
    return randomTieBreaker();
}
function randomTieBreaker() {
    return Math.random() < 0.5 ? -1 : 1;
}
