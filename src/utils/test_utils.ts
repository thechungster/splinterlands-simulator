import { GameMonster } from '../game_monster';
import { GameSummoner } from '../game_summoner';
import { CardColor, CardDetail, CardStats, CardType } from '../types';

export const DEFAULT_MONSTER_STAT = 5;

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveSameStats(expected: GameMonster): CustomMatcherResult;
      toHaveSameBasicStats(expected: GameMonster): CustomMatcherResult;
    }
  }
}
expect.extend({
  toHaveSameStats(monsterOne: GameMonster, monsterTwo: GameMonster) {
    let sameAbilities = monsterOne.abilities.size === monsterTwo.abilities.size;
    monsterOne.abilities.forEach((ability) => {
      const hasAbility = monsterTwo.abilities.has(ability);
      if (!hasAbility) {
        sameAbilities = false;
      }
    });
    const buffListOne = monsterOne.getAllBuffs();
    const buffListTwo = monsterTwo.getAllBuffs();
    let sameBuffs = buffListOne.size === buffListTwo.size;
    buffListOne.forEach((value, key) => {
      const hasBuff = (buffListTwo.get(key) || 0) === value;
      if (!hasBuff) {
        sameBuffs = false;
      }
    });
    const debuffListOne = monsterOne.getDebuffs();
    const debuffListTwo = monsterTwo.getDebuffs();
    let sameDebuffs = debuffListOne.size === debuffListTwo.size;
    debuffListOne.forEach((value, key) => {
      const hasDebuff = (debuffListTwo.get(key) || 0) === value;
      if (!hasDebuff) {
        sameDebuffs = false;
      }
    });
    const sameBasicStats =
      monsterOne.health === monsterTwo.health &&
      monsterOne.speed === monsterTwo.speed &&
      monsterOne.armor === monsterTwo.armor &&
      monsterOne.melee === monsterTwo.melee &&
      monsterOne.magic === monsterTwo.magic &&
      monsterOne.ranged === monsterTwo.ranged;
    const pass = sameAbilities && sameBuffs && sameDebuffs && sameBasicStats;

    const message = () => {
      if (pass) {
        return '';
      }
      return `${monsterOne} ${monsterTwo}`;
    };

    return {
      pass,
      message,
    };
  },

  toHaveSameBasicStats(monsterOne: GameMonster, monsterTwo: GameMonster) {
    const pass =
      monsterOne.health === monsterTwo.health &&
      monsterOne.speed === monsterTwo.speed &&
      monsterOne.armor === monsterTwo.armor &&
      monsterOne.melee === monsterTwo.melee &&
      monsterOne.magic === monsterTwo.magic &&
      monsterOne.ranged === monsterTwo.ranged;

    const message = () => {
      if (pass) {
        return `Equal stats!`;
      }
      return `Health: ${monsterOne.health} ${monsterTwo.health}
              Speed: ${monsterOne.speed} ${monsterTwo.speed}
              Armor: ${monsterOne.armor} ${monsterTwo.armor}
              Melee: ${monsterOne.melee} ${monsterTwo.melee}
              Magic: ${monsterOne.magic} ${monsterTwo.magic}
              Ranged: ${monsterOne.ranged} ${monsterTwo.ranged}`;
    };

    return {
      pass,
      message,
    };
  },
});

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
