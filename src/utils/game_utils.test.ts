import { GameMonster } from '../game_monster';
import { getDidDodge, monsterTurnComparator } from './game_utils';
import { createFakeCardDetail, getDefaultFakeMeleeOnlyCardDetail } from './test_utils';
import * as abilityUtils from './ability_utils';
import { Ability, AttackType, Ruleset, TeamNumber } from '../types';
import { CardColor, CardDetail, CardStats, CardType } from 'splinterlands-types';

describe('game_utils', () => {
  const emptySet = new Set<Ruleset>();
  let randomChanceSpy: jest.SpyInstance;

  describe('getDidDodge function', () => {
    let attackingMonster: GameMonster;
    let attackTarget: GameMonster;

    beforeEach(() => {
      randomChanceSpy = jest.spyOn(abilityUtils, 'getSuccessBelow');
      randomChanceSpy.mockClear();
      attackingMonster = new GameMonster(getDefaultFakeMeleeOnlyCardDetail(), 1);
      attackTarget = new GameMonster(getDefaultFakeMeleeOnlyCardDetail(), 1);
    });

    afterAll(() => {
      randomChanceSpy.mockClear();
    });

    it('returns false if attack type is magic and target does not have phase', () => {
      const didDodge = getDidDodge(emptySet, attackingMonster, attackTarget, AttackType.MAGIC);
      expect(didDodge).toBe(false);
      expect(randomChanceSpy).not.toHaveBeenCalled();
    });

    it('calls getSuccessBelow if attack type is magic and target has phase', () => {
      attackTarget.addAbility(Ability.PHASE);
      const didDodge = getDidDodge(emptySet, attackingMonster, attackTarget, AttackType.MAGIC);
      expect(didDodge).toBe(false);
      expect(randomChanceSpy).toHaveBeenCalledWith(0);
    });

    it('returns false if attacking monster has true strike', () => {
      attackingMonster.addAbility(Ability.TRUE_STRIKE);
      const didDodge = getDidDodge(emptySet, attackingMonster, attackTarget, AttackType.RANGED);
      expect(didDodge).toBe(false);
      expect(randomChanceSpy).not.toHaveBeenCalled();
    });

    it('returns false if attacking monster has snamre and attack target is flying ', () => {
      attackingMonster.addAbility(Ability.SNARE);
      attackTarget.addAbility(Ability.FLYING);
      const didDodge = getDidDodge(emptySet, attackingMonster, attackTarget, AttackType.RANGED);
      expect(didDodge).toBe(false);
      expect(randomChanceSpy).not.toHaveBeenCalled();
    });

    it('gives 10% chance per speed difference if attacking is slower', () => {
      attackingMonster.speed = 1;
      attackTarget.speed = 5;
      getDidDodge(emptySet, attackingMonster, attackTarget, AttackType.RANGED);
      expect(randomChanceSpy).toHaveBeenCalledWith(40);
    });

    it('gives 10% chance per speed difference if attacking is faster and ruleset is reverse speed', () => {
      attackingMonster.addBuff(Ability.SWIFTNESS);
      attackingMonster.speed = 4;
      attackTarget.speed = 1;
      const rules = new Set<Ruleset>();
      rules.add(Ruleset.REVERSE_SPEED);
      getDidDodge(rules, attackingMonster, attackTarget, AttackType.RANGED);
      expect(randomChanceSpy).toHaveBeenCalledWith(40);
    });

    it('gives no chance to dodge if attacker is faster', () => {
      attackingMonster.speed = 5;
      attackTarget.speed = 1;
      getDidDodge(emptySet, attackingMonster, attackTarget, AttackType.RANGED);
      expect(randomChanceSpy).toHaveBeenCalledWith(0);
    });

    it('gives 25% dodge chance for flying', () => {
      attackTarget.addAbility(Ability.FLYING);
      getDidDodge(emptySet, attackingMonster, attackTarget, AttackType.RANGED);
      expect(randomChanceSpy).toHaveBeenCalledWith(25);
    });

    it("doesn't give dodge chance for flying if attacking is also flying", () => {
      attackTarget.addAbility(Ability.FLYING);
      attackingMonster.addAbility(Ability.FLYING);
      getDidDodge(emptySet, attackingMonster, attackTarget, AttackType.RANGED);
      expect(randomChanceSpy).toHaveBeenCalledWith(0);
    });

    it("gives 15% chance for blind and it doesn't stack", () => {
      attackingMonster.addDebuff(Ability.BLIND);
      attackingMonster.addDebuff(Ability.BLIND);
      getDidDodge(emptySet, attackingMonster, attackTarget, AttackType.RANGED);
      expect(randomChanceSpy).toHaveBeenCalledWith(15);
    });

    it('gives 25% chance for dodge', () => {
      attackTarget.addAbility(Ability.DODGE);
      getDidDodge(emptySet, attackingMonster, attackTarget, AttackType.RANGED);
      expect(randomChanceSpy).toHaveBeenCalledWith(25);
    });
  });

  describe('monsterTurnComparator function', () => {
    let monsterOne: GameMonster;
    let monsterTwo: GameMonster;

    beforeEach(() => {
      monsterOne = new GameMonster(getDefaultFakeMeleeOnlyCardDetail(), 1);
      monsterTwo = new GameMonster(getDefaultFakeMeleeOnlyCardDetail(), 1);
    });

    it('returns the difference of the monster speed if speed is different', () => {
      monsterOne.speed = 2;
      monsterTwo.speed = 5;
      expect(monsterTurnComparator(monsterOne, monsterTwo)).toBe(2 - 5);
      monsterOne.speed = 3;
      monsterTwo.speed = 1;
      expect(monsterTurnComparator(monsterOne, monsterTwo)).toBe(3 - 1);
    });

    describe('on speed ties', () => {
      it('returns the magic user as faster if other one has no magic', () => {
        monsterOne.magic = 5;
        monsterTwo.magic = 0;
        expect(monsterTurnComparator(monsterOne, monsterTwo)).toBe(1);
        monsterOne.magic = 0;
        monsterTwo.magic = 3;
        expect(monsterTurnComparator(monsterOne, monsterTwo)).toBe(-1);
      });

      it('returns the ranged user as faster if other one has no ranged or magic', () => {
        monsterOne.ranged = 5;
        monsterTwo.ranged = 0;
        expect(monsterTurnComparator(monsterOne, monsterTwo)).toBe(1);
        monsterOne.ranged = 0;
        monsterTwo.ranged = 3;
        expect(monsterTurnComparator(monsterOne, monsterTwo)).toBe(-1);
      });

      it('returns the rarer monster if the rest of stats are same', () => {
        monsterOne = createCardOfRarityAndLevel(/* rarity */ 4, /* level */ 1);
        monsterTwo = createCardOfRarityAndLevel(/* rarity */ 1, /* level */ 1);
        expect(monsterTurnComparator(monsterOne, monsterTwo)).toBe(3);
        monsterOne = createCardOfRarityAndLevel(/* rarity */ 1, /* level */ 1);
        monsterTwo = createCardOfRarityAndLevel(/* rarity */ 3, /* level */ 1);
        expect(monsterTurnComparator(monsterOne, monsterTwo)).toBe(-2);
      });

      it('returns the higher level monster if the rest of stats are same', () => {
        monsterOne = createCardOfRarityAndLevel(/* rarity */ 1, /* level */ 4);
        monsterTwo = createCardOfRarityAndLevel(/* rarity */ 1, /* level */ 1);
        expect(monsterTurnComparator(monsterOne, monsterTwo)).toBe(3);
        monsterOne = createCardOfRarityAndLevel(/* rarity */ 1, /* level */ 1);
        monsterTwo = createCardOfRarityAndLevel(/* rarity */ 1, /* level */ 3);
        expect(monsterTurnComparator(monsterOne, monsterTwo)).toBe(-2);
      });

      it("returns the monster that doesn't have an attack if stats are same and monsters are on the same team", () => {
        monsterOne.melee = 0;
        monsterOne.setTeam(TeamNumber.ONE);
        monsterTwo.setTeam(TeamNumber.ONE);
        expect(monsterTurnComparator(monsterOne, monsterTwo)).toBe(1);
        monsterOne.melee = 5;
        monsterTwo.melee = 0;
        expect(monsterTurnComparator(monsterOne, monsterTwo)).toBe(-1);
      });

      it('returns random monster if stats are same and monsters are on the different team', () => {
        const randomSpy = jest.spyOn<Math, any>(Math, 'random');
        monsterOne.setTeam(TeamNumber.ONE);
        monsterTwo.setTeam(TeamNumber.TWO);
        randomSpy.mockReturnValue(0.3);
        expect(monsterTurnComparator(monsterOne, monsterTwo)).toBe(-1);
        randomSpy.mockReturnValue(0.8);
        expect(monsterTurnComparator(monsterOne, monsterTwo)).toBe(1);
      });
    });
  });
});

function createCardOfRarityAndLevel(rarity: number, level: number) {
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

  const card = {
    id: 9999,
    color: CardColor.BLACK,
    type: CardType.MONSTER,
    rarity,
    is_starter: false,
    editions: '1',
    stats,
  } as CardDetail;

  return new GameMonster(card, level);
}
