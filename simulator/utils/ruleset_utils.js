"use strict";
exports.__esModule = true;
exports.applyEarthquake = exports.doRulesetPreGamePostBuff = exports.doRulesetPreGameBuff = void 0;
var types_1 = require("../types");
var ability_utils_1 = require("./ability_utils");
var damage_utils_1 = require("./damage_utils");
function doRulesetPreGameBuff(rulesets, team1, team2) {
    if (rulesets.has(types_1.Ruleset.ARMORED_UP)) {
        applyToBothTeamMonsters(team1, team2, applyArmorUpRuleset);
    }
    if (rulesets.has(types_1.Ruleset.BACK_TO_BASICS)) {
        applyToBothTeamMonsters(team1, team2, applyBackToBasicsRuleset);
    }
    if (rulesets.has(types_1.Ruleset.CLOSE_RANGE)) {
        applyToBothTeamMonsters(team1, team2, applyCloseRangeRuleset);
    }
    if (rulesets.has(types_1.Ruleset.EQUAL_OPPORTUNITY)) {
        applyToBothTeamMonsters(team1, team2, applyEqualOpportunity);
    }
    if (rulesets.has(types_1.Ruleset.EQUALIZER)) {
        applyEqualizer(team1, team2);
    }
    if (rulesets.has(types_1.Ruleset.EXPLOSIVE_WEAPONRY)) {
        applyToBothTeamMonsters(team1, team2, applyExplosiveWeaponry);
    }
    if (rulesets.has(types_1.Ruleset.FOG_OF_WAR)) {
        applyToBothTeamMonsters(team1, team2, applyFogOfWar);
    }
    if (rulesets.has(types_1.Ruleset.HEALED_OUT)) {
        applyToBothTeamMonsters(team1, team2, applyHealedOut);
    }
    if (rulesets.has(types_1.Ruleset.HEAVY_HITTERS)) {
        applyToBothTeamMonsters(team1, team2, applyHeavyHitters);
    }
    if (rulesets.has(types_1.Ruleset.HOLY_PROTECTION)) {
        applyToBothTeamMonsters(team1, team2, applyHolyProtection);
    }
    if (rulesets.has(types_1.Ruleset.MELEE_MAYHEM)) {
        applyToBothTeamMonsters(team1, team2, applyMeleeMayhem);
    }
    if (rulesets.has(types_1.Ruleset.NOXIOUS_FUMES)) {
        applyToBothTeamMonsters(team1, team2, applyNoxiousFumes);
    }
    if (rulesets.has(types_1.Ruleset.SILENCED_SUMMONERS)) {
        applySilencedSummoners(team1, team2);
    }
    if (rulesets.has(types_1.Ruleset.SPREADING_FURY)) {
        applyToBothTeamMonsters(team1, team2, applySpreadingFury);
    }
    if (rulesets.has(types_1.Ruleset.SUPER_SNEAK)) {
        applyToBothTeamMonsters(team1, team2, applySuperSneak);
    }
    if (rulesets.has(types_1.Ruleset.WEAK_MAGIC)) {
        applyToBothTeamMonsters(team1, team2, applyWeakMagic);
    }
    if (rulesets.has(types_1.Ruleset.TARGET_PRACTICE)) {
        applyToBothTeamMonsters(team1, team2, applyTargetPractice);
    }
}
exports.doRulesetPreGameBuff = doRulesetPreGameBuff;
function doRulesetPreGamePostBuff(rulesets, team1, team2) {
    if (rulesets.has(types_1.Ruleset.UNPROTECTED)) {
        applyToBothTeamMonsters(team1, team2, applyUnprotected);
    }
}
exports.doRulesetPreGamePostBuff = doRulesetPreGamePostBuff;
function applyToBothTeamMonsters(team1, team2, fn) {
    team1.getMonstersList().forEach(fn);
    team2.getMonstersList().forEach(fn);
}
/* Ruleset functions */
// + 2 armor
function applyArmorUpRuleset(monster) {
    monster.addSummonerArmor(2);
}
// No abilities
function applyBackToBasicsRuleset(monster) {
    monster.removeAllAbilities();
}
// Ranged units can be used in the front
function applyCloseRangeRuleset(monster) {
    monster.addAbility(types_1.Ability.CLOSE_RANGE);
}
/** Do 2 physical damage to monsters that don't have flying ability */
function applyEarthquake(monster) {
    if (!monster.hasAbility(types_1.Ability.FLYING) || monster.hasDebuff(types_1.Ability.SNARE)) {
        (0, damage_utils_1.hitMonsterWithPhysical)(monster, ability_utils_1.EARTHQUAKE_DAMAGE);
    }
}
exports.applyEarthquake = applyEarthquake;
/**
 * All monsters have Opportunity.
 */
function applyEqualOpportunity(monster) {
    if (!monster.hasAbility(types_1.Ability.SNEAK) &&
        !monster.hasAbility(types_1.Ability.SNIPE)) {
        monster.addAbility(types_1.Ability.OPPORTUNITY);
    }
}
/** All monsters have health equal to the highest hp monster in the game */
function applyEqualizer(team1, team2) {
    var allMonsters = team1.getMonstersList().concat(team2.getMonstersList());
    var highestHp = 0;
    allMonsters.forEach(function (monster) { return (highestHp = Math.max(monster.health, highestHp)); });
    allMonsters.forEach(function (monster) {
        monster.health = highestHp;
        monster.startingHealth = highestHp;
    });
}
/** All monsters have blast */
function applyExplosiveWeaponry(monster) {
    monster.addAbility(types_1.Ability.BLAST);
}
/** No sneak or snipe */
function applyFogOfWar(monster) {
    monster.removeAbility(types_1.Ability.SNEAK);
    monster.removeAbility(types_1.Ability.SNIPE);
}
/** No healing abilities */
function applyHealedOut(monster) {
    monster.removeAbility(types_1.Ability.TANK_HEAL);
    monster.removeAbility(types_1.Ability.HEAL);
    monster.removeAbility(types_1.Ability.TRIAGE);
}
/** All monsters have Knock Out */
function applyHeavyHitters(monster) {
    monster.addAbility(types_1.Ability.KNOCK_OUT);
}
/** All monsters have holy protection */
function applyHolyProtection(monster) {
    monster.addAbility(types_1.Ability.DIVINE_SHIELD);
}
/** Monsters can attack from any position */
function applyMeleeMayhem(monster) {
    monster.addAbility(types_1.Ability.MELEE_MAYHEM);
}
/** All monsters poisoned */
function applyNoxiousFumes(monster) {
    monster.addDebuff(types_1.Ability.POISON);
}
/** Summoners don't do anything */
function applySilencedSummoners(team1, team2) {
    silenceSummoner(team1.getSummoner());
    silenceSummoner(team2.getSummoner());
}
function silenceSummoner(summoner) {
    summoner.abilities.clear();
    summoner.health = 0;
    summoner.armor = 0;
    summoner.speed = 0;
    summoner.melee = 0;
    summoner.ranged = 0;
    summoner.magic = 0;
}
/** All monsters have enrage */
function applySpreadingFury(monster) {
    monster.addAbility(types_1.Ability.ENRAGE);
}
/**
 * TODO(bug) This has the same issue as Equal Opportunity
 * All melee monsters have sneak
 * */
function applySuperSneak(monster) {
    if (monster.melee > 0) {
        monster.addAbility(types_1.Ability.SNEAK);
    }
}
/** All monsters have void armor */
function applyWeakMagic(monster) {
    monster.addAbility(types_1.Ability.VOID_ARMOR);
}
/**
 * All ranged and magic have snipe
 */
function applyTargetPractice(monster) {
    if (monster.ranged > 0 || monster.magic > 0) {
        monster.addAbility(types_1.Ability.SNIPE);
    }
}
/**
 * Monsters don't have armor.
 */
function applyUnprotected(monster) {
    monster.armor = 0;
    monster.startingArmor = -99;
}
