import { GameCard } from './game_card';

// Things for the battle
export interface Team {
  summoner: CardDetail;
  monsters: CardDetail[];
}

export interface BattleDamage {
  // Some things care about if actually hit or not. Don't use this to check damage
  attack: number;
  // Actual damage done after modifiers
  damageDone: number;
  // Remainder damage after modifiers
  remainder: number;
}

/**
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
  TANK_HEAL = 'Tank Heal',
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
  TAUNT = 'Taunt',
  THORNS = 'Thorns',
  TRAMPLE = 'Trample',
  TRIAGE = 'Triage',
  TRUE_STRIKE = 'True Strike',
  VOID_ARMOR = 'Void Armor',
  VOID = 'Void',
  WEAKEN = 'Weaken',
  /* Ruleset Ability */
  MELEE_MAYHEM = 'Melee Mayhem',
}

export enum Ruleset {
  AIM_TRUE = 'Aim True',
  ARMORED_UP = 'Armored Up',
  BACK_TO_BASICS = 'Back to Basics',
  BROKEN_ARROWS = 'Broken Arrows',
  CLOSE_RANGE = 'Close Range',
  EARTHQUAKE = 'Earthquake',
  EQUAL_OPPORTUNITY = 'Equal Opportunity',
  EQUALIZER = 'Equalizer',
  EVEN_STEVENS = 'Even Stevens',
  EXPLOSIVE_WEAPONRY = 'Explosive Weaponry',
  FOG_OF_WAR = 'Fog of War',
  HEALED_OUT = 'Healed Out',
  HEAVY_HITTERS = 'Heavy Hitters',
  HOLY_PROTECTION = 'Holy Protection',
  KEEP_YOUR_DISTANCE = 'Keep Your Distance',
  LITTLE_LEAGUE = 'Little League',
  LOST_LEGENDARIES = 'Lost Legendaries',
  LOST_MAGIC = 'Lost Magic',
  MELEE_MAYHEM = 'Melee Mayhem',
  NOXIOUS_FUMES = 'Noxious Fumes',
  ODD_ONES_OUT = 'Odd Ones Out',
  REVERSE_SPEED = 'Reverse Speed',
  RISE_OF_THE_COMMONS = 'Rise of the Commons',
  SILENCED_SUMMONERS = 'Silenced Summoners',
  SPREADING_FURY = 'Spreading Fury',
  STAMPEDE = 'Stampede',
  STANDARD = 'Standard',
  SUPER_SNEAK = 'Super Sneak',
  TAKING_SIDES = 'Taking Sides',
  TARGET_PRACTICE = 'Target Practice',
  UNPROTECTED = 'Unprotected',
  UP_CLOSE_AND_PERSONAL = 'Up Close & Personal',
  WEAK_MAGIC = 'Weak Magic',
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

export interface BattleHistory {
  battle_queue_id_1: string;
  battle_queue_id_2: string;
  player_1_rating_initial: number;
  player_2_rating_initial: number;
  winner: string;
  player_1_rating_final: number;
  player_2_rating_final: number;
  player_1: string;
  player_2: string;
  created_date: string;
  mana_cap: number;
  ruleset: string;
  inactive: string;
  settings: string;
  details: string;
}

export interface BattleDetails {
  loser: string;
  winner: string;
  type: string;
  team1: BattleTeam;
  team2: BattleTeam;
}

export interface BattleTeam {
  color: string;
  monsters: CollectionCard[];
  summoner: CollectionCard;
  player: string;
  rating: number;
}

export interface CardDetailDistribution {
  card_detail_id: number;
  gold: boolean;
  edition: number;
  num_cards: string;
  total_xp: string;
  num_burned: string;
  total_burned_xp: string;
}

export interface CardDetail {
  // 1 indexed.
  id: number;
  name: string;
  color: CardColor;
  type: CardType;
  rarity: number;
  is_starter: boolean;
  editions: string;
  stats: CardStats;
  drop_rate: number;
  sub_type: any;
  created_block_num: any;
  last_update_tx: string | null;
  total_printed: number;
  is_promo: boolean;
  tier: any;
  distribution: CardDetailDistribution[];
}

export interface PlayerCardDetail {
  player: string;
  uid: string;
  card_detail_id: number;
  level: number;
  xp?: number;
  gold: boolean;
  edition: CardEdition;
  delegated_to?: string;
  delegated_to_display_name?: string;
  market_listing_type?: string;
  last_used_player: string;
  last_used_date?: string;
  last_transferred_block?: number | null;
  last_transferred_date?: string | null;
}

export interface CustomOwnedCardDetail extends CardDetail {
  level: number;
  edition: number;
  uid: number;
}

export interface CollectionCard {
  player?: string;
  uid?: string;
  card_detail_id: number;
  gold: boolean;
  edition: number;
  level: number;
}

export interface CustomCardStats extends CardDetail {
  created_num_block: number;
  drop_rate: number;
  gold: boolean;
  id: number;
  is_promo: boolean;
  is_starter: boolean;
  level: number;
  name: string;
  rarity: number;
  stats: CardStats;
  tier: number;
  total_printed: number;
  uid: string;
  // Custom
  isSelected?: boolean;
  mana: number;
  edition: CardEdition;
  adjustedLevel?: number;
}

export interface CardStats {
  abilities: Ability[] | Ability[][] | undefined;
  mana: number | number[];
  attack: number | number[];
  ranged: number | number[];
  magic: number | number[];
  armor: number | number[];
  health: number | number[];
  speed: number | number[];
}

interface BattleAllowedCards {
  // Brawl and tournament?
  foil?: string;
  // Tournament only?
  type?: string;
  editions?: number[];
}

export enum CardType {
  SUMMONER = 'Summoner',
  MONSTER = 'Monster',
}

export enum CardColor {
  BLACK = 'Black',
  BLUE = 'Blue',
  GOLD = 'Gold',
  GRAY = 'Gray',
  GREEN = 'Green',
  RED = 'Red',
  WHITE = 'White',
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
