import { GameMonster } from '../game_monster';
import { GameSummoner } from '../game_summoner';
import { CardColor, CardDetail, CardStats, CardType } from '../types';

export const DEFAULT_MONSTER_STAT = 5;

export function getDefaultFakeSummoner() {
  const stats = {
    abilities: [],
    mana: 5,
    health: 0,
    speed: 0,
    armor: 0,
    attack: 0,
    ranged: 0,
    magic: 0,
  } as CardStats;
  const details = createFakeCardDetail(stats);
  return new GameSummoner(details, 1);
}

export function getDefaultFakeMonster() {
  const stats = {
    abilities: [],
    mana: DEFAULT_MONSTER_STAT,
    health: DEFAULT_MONSTER_STAT,
    speed: DEFAULT_MONSTER_STAT,
    armor: DEFAULT_MONSTER_STAT,
    attack: DEFAULT_MONSTER_STAT,
    ranged: DEFAULT_MONSTER_STAT,
    magic: DEFAULT_MONSTER_STAT,
  } as CardStats;
  const details = createFakeCardDetail(stats);
  return new GameMonster(details, 1);
}

export function createFakeCardDetail(cardStat: CardStats): CardDetail {
  return {
    id: 9999,
    color: CardColor.BLACK,
    type: CardType.MONSTER,
    rarity: 1,
    is_starter: false,
    editions: '1',
    stats: cardStat,
  } as CardDetail;
}

export function getDefaultFakeMagicOnlyCardDetail(): CardDetail {
  const stats = {
    abilities: [],
    mana: 5,
    health: 5,
    speed: 5,
    armor: 5,
    attack: 0,
    ranged: 0,
    magic: 5,
  } as CardStats;
  return createFakeCardDetail(stats);
}

export function getDefaultFakeRangedOnlyCardDetail(): CardDetail {
  const stats = {
    abilities: [],
    mana: 5,
    health: 5,
    speed: 5,
    armor: 5,
    attack: 0,
    ranged: 5,
    magic: 0,
  } as CardStats;
  return createFakeCardDetail(stats);
}

export function getDefaultFakeMeleeOnlyCardDetail(): CardDetail {
  const stats = {
    abilities: [],
    mana: 5,
    health: 5,
    speed: 5,
    armor: 5,
    attack: 5,
    ranged: 0,
    magic: 0,
  } as CardStats;
  return createFakeCardDetail(stats);
}
