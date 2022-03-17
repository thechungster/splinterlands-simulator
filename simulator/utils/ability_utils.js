"use strict";
exports.__esModule = true;
exports.dispelBuffs = exports.removeDivineShield = exports.resurrectMonster = exports.protectMonster = exports.strengthenMonster = exports.lifeLeechMonster = exports.selfHeal = exports.triageHealMonster = exports.repairMonsterArmor = exports.tankHealMonster = exports.scavengeMonster = exports.rustMonster = exports.weakenMonster = exports.ACTION_ABILITIES = exports.MONSTER_DEBUFF_ABILITIES = exports.MONSTER_BUFF_ABILITIES = exports.SUMMONER_DEBUFF_ABILITIES = exports.SUMMONER_BUFF_ABILITIES = exports.SUMMONER_ABILITY_ABILITIES = exports.ENRAGE_MULTIPLIER = exports.LAST_STAND_MULTIPLIER = exports.BLIND_DODGE_CHANCE = exports.FLYING_DODGE_CHANCE = exports.DODGE_CHANCE = exports.POISON_DAMAGE = exports.POISON_CHANCE = exports.STUN_CHANCE = exports.RETALIATE_CHANCE = exports.AFFLICTION_CHANCE = exports.BLAST_MULTIPLIER = exports.MINIMUM_SELF_HEAL = exports.MINIMUM_TRIAGE_HEAL = exports.TRIAGE_HEAL_MULTIPLIER = exports.TANK_HEAL_MULTIPLIER = exports.REPAIR_AMOUNT = exports.SCAVENGER_AMOUNT = exports.LIFE_LEECH_AMOUNT = exports.STRENGTHEN_AMOUNT = exports.WEAKEN_AMOUNT = exports.CRIPPLE_AMOUNT = exports.PROTECT_AMOUNT = exports.THORNS_DAMAGE = exports.BACKFIRE_DAMAGE = exports.REDEMPTION_DAMAGE = exports.RUST_AMOUNT = exports.EARTHQUAKE_DAMAGE = void 0;
var types_1 = require("../types");
exports.EARTHQUAKE_DAMAGE = 2;
exports.RUST_AMOUNT = 2;
exports.REDEMPTION_DAMAGE = 1;
exports.BACKFIRE_DAMAGE = 2;
exports.THORNS_DAMAGE = 2;
exports.PROTECT_AMOUNT = 2;
exports.CRIPPLE_AMOUNT = 1;
exports.WEAKEN_AMOUNT = 1;
exports.STRENGTHEN_AMOUNT = 1;
exports.LIFE_LEECH_AMOUNT = 1;
exports.SCAVENGER_AMOUNT = 1;
exports.REPAIR_AMOUNT = 2;
exports.TANK_HEAL_MULTIPLIER = 1 / 3;
exports.TRIAGE_HEAL_MULTIPLIER = 1 / 3;
exports.MINIMUM_TRIAGE_HEAL = 2;
exports.MINIMUM_SELF_HEAL = 2;
exports.BLAST_MULTIPLIER = 1 / 2;
// https://splinterlands.fandom.com/wiki/Category:Ability
exports.AFFLICTION_CHANCE = 1 / 2;
exports.RETALIATE_CHANCE = 1 / 2;
exports.STUN_CHANCE = 1 / 2;
exports.POISON_CHANCE = 1 / 2;
exports.POISON_DAMAGE = 2;
exports.DODGE_CHANCE = 1 / 2;
exports.FLYING_DODGE_CHANCE = 1 / 4;
exports.BLIND_DODGE_CHANCE = 1 / 4;
/** Stat multiplier for Last stand */
exports.LAST_STAND_MULTIPLIER = 1.5;
/** Stat multiplier for enrage */
exports.ENRAGE_MULTIPLIER = 1.5;
/** Abilities that summoner applies to friendly team at the start of the game */
exports.SUMMONER_ABILITY_ABILITIES = [
    types_1.Ability.AFFLICTION,
    types_1.Ability.BLAST,
    types_1.Ability.DIVINE_SHIELD,
    types_1.Ability.FLYING,
    types_1.Ability.LAST_STAND,
    types_1.Ability.MAGIC_REFLECT,
    types_1.Ability.PIERCING,
    types_1.Ability.RETURN_FIRE,
    types_1.Ability.SNARE,
    types_1.Ability.THORNS,
    types_1.Ability.TRUE_STRIKE,
    types_1.Ability.VOID,
    types_1.Ability.POISON,
];
/** Buffs that summoner applies to friendly team at the start of the game */
exports.SUMMONER_BUFF_ABILITIES = [types_1.Ability.STRENGTHEN];
/** Abilities that summoner applies to enemy team at the start of the game */
exports.SUMMONER_DEBUFF_ABILITIES = [types_1.Ability.BLIND];
/** Abilities that monsters apply to friendly team at the start of the game */
exports.MONSTER_BUFF_ABILITIES = [
    types_1.Ability.AMPLIFY,
    types_1.Ability.PROTECT,
    types_1.Ability.STRENGTHEN,
    types_1.Ability.SWIFTNESS,
    types_1.Ability.INSPIRE,
];
/** Abilities that monsters apply to enemy team at the start of the game */
exports.MONSTER_DEBUFF_ABILITIES = [
    types_1.Ability.AMPLIFY,
    types_1.Ability.BLIND,
    types_1.Ability.DEMORALIZE,
    types_1.Ability.HEADWINDS,
    types_1.Ability.RUST,
    types_1.Ability.SLOW,
    types_1.Ability.SILENCE,
    types_1.Ability.WEAKEN,
];
/** Abilities that require a turn to do something */
exports.ACTION_ABILITIES = [types_1.Ability.REPAIR, types_1.Ability.TANK_HEAL];
/**
 * Decrease max hp of the monster by 1.
 */
function weakenMonster(monster) {
    monster.health = Math.max(monster.health - 1, 1);
}
exports.weakenMonster = weakenMonster;
/** Apply rust to a monster */
function rustMonster(monster) {
    monster.armor = Math.max(0, monster.armor - exports.RUST_AMOUNT);
}
exports.rustMonster = rustMonster;
function scavengeMonster(monster) {
    monster.addHealth(1);
}
exports.scavengeMonster = scavengeMonster;
function tankHealMonster(monster) {
    if (monster.hasDebuff(types_1.Ability.AFFLICTION)) {
        return 0;
    }
    var previousHealth = monster.health;
    var maxHealth = monster.getPostAbilityMaxHealth();
    var healAmount = Math.max(Math.floor(maxHealth * exports.TANK_HEAL_MULTIPLIER), 2);
    monster.addHealth(healAmount);
    (0, types_1.coloredConsoleLog)("Tank healing ".concat(monster.getName(), ", now have ").concat(monster.health), 'white', 'green');
    return previousHealth - monster.health;
}
exports.tankHealMonster = tankHealMonster;
function repairMonsterArmor(monster) {
    if (monster === null) {
        return 0;
    }
    var previousArmor = monster.armor;
    var maxArmor = monster.getPostAbilityMaxArmor();
    var newArmorAmt = Math.min(maxArmor, monster.armor + exports.REPAIR_AMOUNT);
    monster.armor = newArmorAmt;
    (0, types_1.coloredConsoleLog)("Repairing armor to ".concat(monster.getName(), ". Now have ").concat(monster.armor, " armor"), '#03f8fc');
    return newArmorAmt - previousArmor;
}
exports.repairMonsterArmor = repairMonsterArmor;
function triageHealMonster(monster) {
    if (monster === null || monster.hasDebuff(types_1.Ability.AFFLICTION)) {
        return 0;
    }
    var previousHealth = monster.health;
    var maxHealth = monster.getPostAbilityMaxHealth();
    var healAmt = Math.max(Math.floor(maxHealth * exports.TRIAGE_HEAL_MULTIPLIER), exports.MINIMUM_TRIAGE_HEAL);
    monster.addHealth(healAmt);
    return previousHealth - monster.health;
}
exports.triageHealMonster = triageHealMonster;
function selfHeal(self) {
    if (self.hasDebuff(types_1.Ability.AFFLICTION)) {
        return 0;
    }
    var previousHealth = self.health;
    var maxHealth = self.getPostAbilityMaxHealth();
    var healAmount = Math.max(Math.floor(maxHealth / 3), exports.MINIMUM_SELF_HEAL);
    self.addHealth(healAmount);
    (0, types_1.coloredConsoleLog)("".concat(self.getName(), " self healing now have ").concat(self.health), 'white', 'green');
    return previousHealth - self.health;
}
exports.selfHeal = selfHeal;
function lifeLeechMonster(monster) {
    monster.addHealth(1);
}
exports.lifeLeechMonster = lifeLeechMonster;
function strengthenMonster(monster) {
    monster.addHealth(1);
}
exports.strengthenMonster = strengthenMonster;
function protectMonster(monster) {
    monster.armor = monster.armor + 2;
}
exports.protectMonster = protectMonster;
function resurrectMonster(monster) {
    monster.health = 1;
    monster.armor = monster.startingArmor;
    monster.cleanseDebuffs();
}
exports.resurrectMonster = resurrectMonster;
function removeDivineShield(monster) {
    monster.removeAbility(types_1.Ability.DIVINE_SHIELD);
}
exports.removeDivineShield = removeDivineShield;
function dispelBuffs(monster) {
    var buffsSet = monster.getAllBuffs();
    buffsSet.forEach(function (value, ability) {
        if (ability === types_1.Ability.SCAVENGER || ability === types_1.Ability.LIFE_LEECH) {
            monster.removeBuff(ability);
        }
        monster.removeAllBuff(ability);
    });
}
exports.dispelBuffs = dispelBuffs;
