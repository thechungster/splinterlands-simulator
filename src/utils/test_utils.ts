import { Ability, CardColor, CardDetail, CardStats, CardType } from '../types';

export function createFakeCardDetail(
  abilities: Ability[],
  mana: number,
  health: number,
  speed: number,
  armor: number,
  melee: number,
  ranged: number,
  magic: number,
): CardDetail {
  const fakeCardStat = {
    abilities: abilities,
    mana,
    health,
    speed,
    armor,
    ranged,
    magic,
    attack: melee,
  } as CardStats;

  return {
    id: 9999,
    color: CardColor.BLACK,
    type: CardType.MONSTER,
    rarity: 1,
    is_starter: false,
    editions: '1',
    stats: fakeCardStat,
  } as CardDetail;
}
