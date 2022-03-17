"use strict";
exports.__esModule = true;
exports.hitMonsterWithPhysical = exports.hitMonsterWithMagic = void 0;
var types_1 = require("../types");
// TODO: Should this return the reduced damage or normal? Life steal against void?
/** Hits the monster with magic damage. Returns the remainder damage. */
function hitMonsterWithMagic(attackTarget, magicDamage) {
    if (attackTarget.hasAbility(types_1.Ability.FORCEFIELD) && magicDamage >= 5) {
        magicDamage = 1;
    }
    // For things like magic reflect
    if (attackTarget.hasAbility(types_1.Ability.DIVINE_SHIELD)) {
        attackTarget.removeAbility(types_1.Ability.DIVINE_SHIELD);
        return {
            attack: 1,
            damageDone: 0,
            remainder: 0
        };
    }
    if (magicDamage < 1) {
        return {
            attack: 0,
            damageDone: 0,
            remainder: 0
        };
    }
    if (attackTarget.hasAbility(types_1.Ability.VOID)) {
        if (magicDamage === 1) {
            return {
                attack: 1,
                damageDone: 0,
                remainder: 1
            };
        }
        magicDamage = Math.floor((magicDamage + 1) / 2);
    }
    if (attackTarget.hasAbility(types_1.Ability.VOID_ARMOR)) {
        if (attackTarget.armor > 0) {
            return {
                attack: magicDamage,
                damageDone: magicDamage,
                remainder: hitArmor(attackTarget, magicDamage)
            };
        }
        else {
            return {
                attack: magicDamage,
                damageDone: magicDamage,
                remainder: hitHealth(attackTarget, magicDamage)
            };
        }
    }
    else {
        return {
            attack: magicDamage,
            damageDone: magicDamage,
            remainder: hitHealth(attackTarget, magicDamage)
        };
    }
}
exports.hitMonsterWithMagic = hitMonsterWithMagic;
/** Hits the monster with physical damage. Returns the remainder damage. */
function hitMonsterWithPhysical(attackTarget, damageAmt) {
    if (attackTarget.hasAbility(types_1.Ability.FORCEFIELD) && damageAmt >= 5) {
        damageAmt = 1;
    }
    // For things like thorns
    // TODO: Put this in the battle logger.
    if (attackTarget.hasAbility(types_1.Ability.DIVINE_SHIELD)) {
        attackTarget.removeAbility(types_1.Ability.DIVINE_SHIELD);
        return {
            attack: 1,
            damageDone: 0,
            remainder: 0
        };
    }
    if (damageAmt < 1) {
        return {
            attack: 0,
            damageDone: 0,
            remainder: 0
        };
    }
    if (attackTarget.hasAbility(types_1.Ability.SHIELD)) {
        if (damageAmt === 1) {
            return {
                attack: 1,
                damageDone: 0,
                remainder: 1
            };
        }
        damageAmt = Math.floor((damageAmt + 1) / 2);
    }
    if (attackTarget.armor > 0) {
        return {
            attack: damageAmt,
            damageDone: damageAmt,
            remainder: hitArmor(attackTarget, damageAmt)
        };
    }
    hitHealth(attackTarget, damageAmt);
    // Overkill is fine
    return {
        attack: damageAmt,
        damageDone: damageAmt,
        remainder: 0
    };
}
exports.hitMonsterWithPhysical = hitMonsterWithPhysical;
/** Returns remainder damage after hitting armor. */
function hitArmor(attackTarget, damageAmt) {
    (0, types_1.coloredConsoleLog)("Hitting armor of ".concat(attackTarget.getName(), " for ").concat(damageAmt));
    var remainderArmor = attackTarget.armor - damageAmt;
    if (remainderArmor < 0) {
        attackTarget.armor = 0;
        (0, types_1.coloredConsoleLog)("".concat(attackTarget.getName(), " now has ").concat(attackTarget.health, " health, ").concat(attackTarget.armor, " armor"));
        return remainderArmor * -1;
    }
    attackTarget.armor = remainderArmor;
    (0, types_1.coloredConsoleLog)("".concat(attackTarget.getName(), " now has ").concat(attackTarget.health, " health, ").concat(attackTarget.armor, " armor"));
    return 0;
}
/** Returns remainder damage after hitting health. */
function hitHealth(attackTarget, damageAmt) {
    var preHitHealth = attackTarget.health;
    attackTarget.addHealth(-1 * damageAmt);
    if (attackTarget.health < 0) {
        return attackTarget.health * -1;
    }
    // Do we even need this??
    if (attackTarget.health === 0) {
        return damageAmt - preHitHealth;
    }
    (0, types_1.coloredConsoleLog)("".concat(attackTarget.getName(), " now has ").concat(attackTarget.health, " health, ").concat(attackTarget.armor, " armor"));
    return 0;
}
