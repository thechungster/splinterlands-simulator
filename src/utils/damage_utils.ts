import { GameMonster } from '../game_monster';
import { Ability, BattleDamage } from '../types';
import { FORCEFIELD_MIN_DAMAGE } from './ability_utils';

// TODO: Should this return the reduced damage or normal? Life steal against void?
/** Hits the monster with magic damage. Returns the remainder damage. */
export function hitMonsterWithMagic(attackTarget: GameMonster, magicDamage: number): BattleDamage {
  if (attackTarget.hasAbility(Ability.FORCEFIELD) && magicDamage >= FORCEFIELD_MIN_DAMAGE) {
    magicDamage = 1;
  }
  // For things like magic reflect
  if (attackTarget.hasAbility(Ability.DIVINE_SHIELD)) {
    attackTarget.removeDivineShield();
    return {
      attack: 1,
      damageDone: 0,
      remainder: 0,
      actualDamageDone: 0,
    };
  }
  if (magicDamage < 1) {
    return {
      attack: 0,
      damageDone: 0,
      remainder: 0,
      actualDamageDone: 0,
    };
  }
  if (attackTarget.hasAbility(Ability.VOID)) {
    if (magicDamage === 1) {
      return {
        attack: 1,
        damageDone: 0,
        remainder: 1,
        actualDamageDone: 0,
      };
    }
    magicDamage = Math.floor((magicDamage + 1) / 2);
  }
  if (attackTarget.hasAbility(Ability.VOID_ARMOR)) {
    if (attackTarget.armor > 0) {
      const remainder = hitArmor(attackTarget, magicDamage);
      return {
        attack: magicDamage,
        damageDone: magicDamage,
        remainder,
        actualDamageDone: magicDamage - remainder,
      };
    } else {
      const remainder = hitHealth(attackTarget, magicDamage);
      return {
        attack: magicDamage,
        damageDone: magicDamage,
        remainder,
        actualDamageDone: magicDamage - remainder,
      };
    }
  } else {
    const remainder = hitHealth(attackTarget, magicDamage);
    return {
      attack: magicDamage,
      damageDone: magicDamage,
      remainder,
      actualDamageDone: magicDamage - remainder,
    };
  }
}

/** Hits the monster with physical damage. Returns the remainder damage. */
export function hitMonsterWithPhysical(attackTarget: GameMonster, damageAmt: number): BattleDamage {
  if (attackTarget.hasAbility(Ability.FORCEFIELD) && damageAmt >= FORCEFIELD_MIN_DAMAGE) {
    damageAmt = 1;
  }
  // For things like thorns, this returns 1 to show a successful attack.
  if (attackTarget.hasAbility(Ability.DIVINE_SHIELD)) {
    attackTarget.removeDivineShield();
    return {
      attack: 1,
      damageDone: 0,
      remainder: 0,
      actualDamageDone: 0,
    };
  }
  if (damageAmt < 1) {
    return {
      attack: 0,
      damageDone: 0,
      remainder: 0,
      actualDamageDone: 0,
    };
  }
  if (attackTarget.hasAbility(Ability.SHIELD)) {
    if (damageAmt === 1) {
      return {
        attack: 1,
        damageDone: 0,
        remainder: 1,
        actualDamageDone: 0,
      };
    }
    damageAmt = Math.floor((damageAmt + 1) / 2);
  }
  if (attackTarget.armor > 0) {
    const remainder = hitArmor(attackTarget, damageAmt);
    return {
      attack: damageAmt,
      damageDone: damageAmt,
      remainder,
      actualDamageDone: damageAmt - remainder,
    };
  }
  const remainderDmg = hitHealth(attackTarget, damageAmt);
  // Overkill is fine
  return {
    attack: damageAmt,
    damageDone: damageAmt,
    remainder: remainderDmg,
    actualDamageDone: damageAmt - remainderDmg,
  };
}

/** Returns remainder damage after hitting armor. */
function hitArmor(attackTarget: GameMonster, damageAmt: number): number {
  const remainderArmor = attackTarget.armor - damageAmt;
  if (remainderArmor < 0) {
    attackTarget.armor = 0;
    return remainderArmor * -1;
  }
  attackTarget.armor = remainderArmor;
  return 0;
}

/** Returns remainder damage after hitting health. */
function hitHealth(attackTarget: GameMonster, damageAmt: number) {
  const preHitHealth = attackTarget.health;
  attackTarget.addHealth(-1 * damageAmt);
  if (attackTarget.health < 0) {
    return attackTarget.health * -1;
  }
  if (attackTarget.health === 0) {
    return damageAmt - preHitHealth;
  }
  return 0;
}
