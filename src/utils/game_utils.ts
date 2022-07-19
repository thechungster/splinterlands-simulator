import { GameMonster } from '../game_monster';
import { Ability, AttackType, Ruleset } from '../types';
import { BLIND_DODGE_CHANCE, DODGE_CHANCE, FLYING_DODGE_CHANCE } from './ability_utils';
import * as abilityUtils from './ability_utils';

const SPEED_DODGE_CHANCE = 0.1;

export function getDidDodge(
  rulesets: Set<Ruleset>,
  attackingMonster: GameMonster,
  attackTarget: GameMonster,
  attackType: AttackType,
): boolean {
  if (attackType === AttackType.MAGIC && !attackTarget.hasAbility(Ability.PHASE)) {
    return false;
  }
  if (attackingMonster.hasAbility(Ability.TRUE_STRIKE)) {
    return false;
  }
  if (attackingMonster.hasAbility(Ability.SNARE) && attackTarget.hasAbility(Ability.FLYING)) {
    return false;
  }
  let speedDifference = attackTarget.getPostAbilitySpeed() - attackingMonster.getPostAbilitySpeed();
  if (rulesets.has(Ruleset.REVERSE_SPEED)) {
    speedDifference *= -1;
  }
  let dodgeChance = speedDifference > 0 ? speedDifference * SPEED_DODGE_CHANCE : 0;
  // _ 25% for Dodge
  if (attackTarget.hasAbility(Ability.DODGE)) {
    dodgeChance += DODGE_CHANCE;
  }
  // +25% for Flying with no snare
  if (
    attackTarget.hasAbility(Ability.FLYING) &&
    !attackingMonster.hasAbility(Ability.FLYING) &&
    !attackTarget.hasDebuff(Ability.SNARE)
  ) {
    dodgeChance += FLYING_DODGE_CHANCE;
  }
  // + 15% if attacker has blind
  if (attackingMonster.hasDebuff(Ability.BLIND)) {
    dodgeChance += BLIND_DODGE_CHANCE;
  }
  return abilityUtils.getSuccessBelow(Math.floor(dodgeChance * 100));
}

// https://support.splinterlands.com/hc/en-us/articles/4414334269460-Attack-Order
export function monsterTurnComparator(monster1: GameMonster, monster2: GameMonster) {
  const normalCompareDiff = normalCompare(monster1, monster2);

  // Descending order
  if (normalCompareDiff !== 0) {
    return normalCompareDiff;
  }
  // Resolve ties by order if same team, else randomly
  // TODO(bug): This doesn't seem right. Why does monster 1 go first if it doesn't have attack
  if (!monster1.hasAttack() && monster1.getTeamNumber() === monster2.getTeamNumber()) {
    return 1;
  } else if (!monster2.hasAttack() && monster1.getTeamNumber() === monster2.getTeamNumber()) {
    return -1;
  }
  // If same team and back line monsters don't have opportunity or sneak or reach, front goes first
  if (monster1.getTeamNumber() === monster2.getTeamNumber()) {
    return resolveFriendlyTies(monster1, monster2);
  } else {
    return randomTieBreaker();
  }
}

// https://support.splinterlands.com/hc/en-us/articles/4414334269460-Attack-Order
function normalCompare(monster1: GameMonster, monster2: GameMonster) {
  const speedDiff = monster1.getPostAbilitySpeed() - monster2.getPostAbilitySpeed();
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
  if (monster1.getRarity() !== monster2.getRarity()) {
    return monster1.getRarity() - monster2.getRarity();
  }
  return monster1.getLevel() - monster2.getLevel();
}

function resolveFriendlyTies(monster1: GameMonster, monster2: GameMonster) {
  const monster1Position = monster1.getCardPosition();
  const monster2Position = monster2.getCardPosition();
  if (!monster1.hasAction() && !monster2.hasAction()) {
    return monster1Position < monster2Position ? -1 : 1;
  }
  return randomTieBreaker();
}

function randomTieBreaker() {
  return Math.random() < 0.5 ? -1 : 1;
}
