import { CardColor, CardDetail, CardStats, CardType } from '../types';

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
