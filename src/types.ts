import { CardDetail } from 'splinterlands-types';
import { GameCard } from './game_card';

// Things for the battle
export interface Team {
  summoner: CardDetail;
  monsters: CardDetail[];
}

// Clean this up
export interface BattleDamage {
  // Some things care about if actually hit or not. Don't use this to check damage
  attack: number;
  // Actual damage done after modifiers, overkills. So 10 dmg to a 1 health is still 10 dmg.
  damageDone: number;
  // Remainder damage after modifiers
  remainder: number;
  // Actual damage done after modifiers, but does not overkill. 10 dmg to a 1 health is 1 dmg.
  actualDamageDone: number;
}

/**
 * https://api2.splinterlands.com/settings
 * var abilityToEnumTS = function(ability) {
 *   var enumName = ability.name.toUpperCase().split(' ').join('_');
 *   return `${enumName} = '${ability.name}',`;
 * }
 * window.abilities.forEach((ability) => str+= abilityToEnumTS(ability));
 * copy(str);
 */
export enum Ability {
  AFFLICTION = 'Affliction',
  AMPLIFY = 'Amplify',
  BACKFIRE = 'Backfire',
  BLAST = 'Blast',
  BLIND = 'Blind',
  BLOODLUST = 'Bloodlust',
  CAMOUFLAGE = 'Camouflage',
  CLEANSE = 'Cleanse',
  CLOSE_RANGE = 'Close Range',
  CRIPPLE = 'Cripple',
  DEATHBLOW = 'Deathblow',
  DEMORALIZE = 'Demoralize',
  DISPEL = 'Dispel',
  DIVINE_SHIELD = 'Divine Shield',
  DODGE = 'Dodge',
  DOUBLE_STRIKE = 'Double Strike',
  ENRAGE = 'Enrage',
  FLYING = 'Flying',
  FORCEFIELD = 'Forcefield',
  GIANT_KILLER = 'Giant Killer',
  HALVING = 'Halving',
  HEADWINDS = 'Headwinds',
  HEAL = 'Heal',
  IMMUNITY = 'Immunity',
  INSPIRE = 'Inspire',
  KNOCK_OUT = 'Knock Out',
  LAST_STAND = 'Last Stand',
  LIFE_LEECH = 'Life Leech',
  MAGIC_REFLECT = 'Magic Reflect',
  OPPORTUNITY = 'Opportunity',
  OPPRESS = 'Oppress',
  PHASE = 'Phase',
  PIERCING = 'Piercing',
  POISON = 'Poison',
  PROTECT = 'Protect',
  REACH = 'Reach',
  RECHARGE = 'Recharge',
  REDEMPTION = 'Redemption',
  REFLECTION_SHIELD = 'Reflection Shield',
  REPAIR = 'Repair',
  RESURRECT = 'Resurrect',
  RETALIATE = 'Retaliate',
  RETURN_FIRE = 'Return Fire',
  RUST = 'Rust',
  SCATTERSHOT = 'Scattershot',
  SCAVENGER = 'Scavenger',
  SHATTER = 'Shatter',
  SHIELD = 'Shield',
  SILENCE = 'Silence',
  SLOW = 'Slow',
  SNARE = 'Snare',
  SNEAK = 'Sneak',
  SNIPE = 'Snipe',
  STRENGTHEN = 'Strengthen',
  STUN = 'Stun',
  SWIFTNESS = 'Swiftness',
  TANK_HEAL = 'Tank Heal',
  TAUNT = 'Taunt',
  THORNS = 'Thorns',
  TRAMPLE = 'Trample',
  TRIAGE = 'Triage',
  TRUE_STRIKE = 'True Strike',
  VOID = 'Void',
  VOID_ARMOR = 'Void Armor',
  WEAKEN = 'Weaken',
  FURY = 'Fury',
  /* Ruleset Ability */
  MELEE_MAYHEM = 'Melee Mayhem',
}

/*
 
 https://api2.splinterlands.com/settings
 s = ''
 window.json.battles.rulesets.forEach((r) => {
 window.json.battles.rulesets.forEach((r) => {
   s += r.name.toUpperCase().split(' ').join('_').split('&').join('AND').split("’").join('') + ' = \'' + r.name + '\',' + '\n';
 });
 copy(s);
 s; 
*/
export enum Ruleset {
  STANDARD = 'Standard',
  BACK_TO_BASICS = 'Back to Basics',
  SILENCED_SUMMONERS = 'Silenced Summoners',
  AIM_TRUE = 'Aim True',
  SUPER_SNEAK = 'Super Sneak',
  WEAK_MAGIC = 'Weak Magic',
  UNPROTECTED = 'Unprotected',
  TARGET_PRACTICE = 'Target Practice',
  FOG_OF_WAR = 'Fog of War',
  ARMORED_UP = 'Armored Up',
  HEALED_OUT = 'Healed Out',
  EARTHQUAKE = 'Earthquake',
  REVERSE_SPEED = 'Reverse Speed',
  CLOSE_RANGE = 'Close Range',
  HEAVY_HITTERS = 'Heavy Hitters',
  EQUALIZER = 'Equalizer',
  KEEP_YOUR_DISTANCE = 'Keep Your Distance',
  LOST_LEGENDARIES = 'Lost Legendaries',
  MELEE_MAYHEM = 'Melee Mayhem',
  TAKING_SIDES = 'Taking Sides',
  RISE_OF_THE_COMMONS = 'Rise of the Commons',
  UP_CLOSE_AND_PERSONAL = 'Up Close & Personal',
  BROKEN_ARROWS = 'Broken Arrows',
  LITTLE_LEAGUE = 'Little League',
  LOST_MAGIC = 'Lost Magic',
  EVEN_STEVENS = 'Even Stevens',
  ODD_ONES_OUT = 'Odd Ones Out',
  NOXIOUS_FUMES = 'Noxious Fumes',
  STAMPEDE = 'Stampede',
  EQUAL_OPPORTUNITY = 'Equal Opportunity',
  BRIAR_PATCH = 'Briar Patch',
  THORNS = 'Thorns',
  EXPLOSIVE_WEAPONRY = 'Explosive Weaponry',
  BRIAR_PATCH = 'Briar Patch',
  HOLY_PROTECTION = 'Holy Protection',
  COUNTERSPELL = 'Counterspell',
  WHAT_DOESNT_KILL_YOU = `What Doesn’t Kill You`,
  FIRE_AND_REGRET = 'Fire & Regret',
  SPREADING_FURY = 'Spreading Fury',
  WHAT_DOESNT_KILL_YOU = 'What Doesn’t Kill You',
  TIS_BUT_SCRATCHES = 'Tis but Scratches',
  UP_TO_ELEVEN = 'Up to Eleven',
  AIMLESS = 'Aimless',
  FEROCITY = 'Ferocity',
  GOING_THE_DISTANCE = 'Going the Distance',
  WANDS_OUT = 'Wands Out',
}

export enum Stat {
  MANA = 'mana',
  ATTACK = 'attack',
  MAGIC = 'magic',
  RANGED = 'ranged',
  ARMOR = 'armor',
  SPEED = 'speed',
  HEALTH = 'health',
}

export enum AttackType {
  MELEE,
  RANGED,
  MAGIC,
}

export enum CardEdition {
  ALPHA,
  BETA,
  PROMO,
  REWARD,
  UNTAMED,
  DICE,
  GLADIUS,
  CHAOS,
  RIFT,
}

export enum CardAttackType {
  MELEE = 'melee',
  RANGED = 'ranged',
  MAGIC = 'magic',
}

export enum FoilType {
  STANDARD = 'standard',
  GOLD = 'gold',
}

export enum TeamNumber {
  UNKNOWN,
  ONE,
  TWO,
  TIE,
}

export enum AdditionalBattleAction {
  DEATH = 3,
  EARTHQUAKE,
  FATIGUE,
  MELEE,
  RANGED,
  MAGIC,
  ROUND_START,
}

export type BattleLogAction = Ability | AdditionalBattleAction | AttackType;

export interface BattleLog {
  /** The summoner or monster performing the action. This is a snapshot of the actor AFTER the action has been performed. */
  actor?: GameCard;
  /** The target of the action. This is a snapshot of the target AFTER the action has been performed. */
  target?: GameCard;
  /** The action */
  action: BattleLogAction;
  /** The value, can be the amount of damage, or heal, etc. Based on the action */
  value?: number;
}
