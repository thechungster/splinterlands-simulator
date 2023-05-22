import { CardStats } from 'splinterlands-types';
import { Game } from '../game';
import { GameMonster } from '../game_monster';
import { Ability } from '../types';
import { hitMonsterWithMagic, hitMonsterWithPhysical } from './damage_utils';
import { createFakeCardDetail } from './test_utils';
jest.mock('../game');

const MONSTER_MAGIC = 5;
const MONSTER_RANGED = 7;
const MONSTER_MELEE = 9;
const MONSTER_HEALTH = 20;
const MONSTER_ARMOR = 5;
const MONSTER_SPEED = 3;
const MONSTER_STATS = {
  abilities: [],
  mana: 1,
  health: MONSTER_HEALTH,
  speed: MONSTER_SPEED,
  armor: MONSTER_ARMOR,
  attack: MONSTER_MELEE,
  ranged: MONSTER_RANGED,
  magic: MONSTER_MAGIC,
} as CardStats;

describe('damage_utils', () => {
  let attackingMonster: GameMonster;
  let attackTarget: GameMonster;
  const fakeGameTeam: Game = new (jest.createMockFromModule('../game') as any).Game();

  beforeEach(() => {
    attackingMonster = new GameMonster(createFakeCardDetail(MONSTER_STATS), 1);
    attackTarget = new GameMonster(createFakeCardDetail(MONSTER_STATS), 1);
  });

  describe('hitMonsterWithMagic function', () => {
    it('only does 1 damage if attack target has force field and attack is >= 5', () => {
      attackTarget.addAbility(Ability.FORCEFIELD);
      hitMonsterWithMagic(fakeGameTeam, null, attackTarget, 5);
      expect(attackTarget.health).toBe(MONSTER_HEALTH - 1);
    });

    it('does full damage if attack target has force field and attack is < 5', () => {
      attackTarget.addAbility(Ability.FORCEFIELD);
      hitMonsterWithMagic(fakeGameTeam, null, attackTarget, 4);
      expect(attackTarget.health).toBe(MONSTER_HEALTH - 4);
    });

    it('giant killer does double damage after force field reduces it if attack is >= 5', () => {
      attackingMonster.addAbility(Ability.GIANT_KILLER);
      attackTarget.mana = 11;
      attackTarget.addAbility(Ability.FORCEFIELD);
      hitMonsterWithMagic(fakeGameTeam, attackingMonster, attackTarget, 10);
      expect(attackTarget.health).toBe(MONSTER_HEALTH - 2);
    });

    it("giant killer does  double damage and force field doesn't reduce it if attack is < 5", () => {
      attackingMonster.addAbility(Ability.GIANT_KILLER);
      attackTarget.addAbility(Ability.FORCEFIELD);
      attackTarget.mana = 11;
      hitMonsterWithMagic(fakeGameTeam, attackingMonster, attackTarget, 4);
      expect(attackTarget.health).toBe(MONSTER_HEALTH - 8);
    });

    it('giant killer does nothing if mana is < 10', () => {
      attackingMonster.addAbility(Ability.GIANT_KILLER);
      attackTarget.addAbility(Ability.FORCEFIELD);
      attackTarget.mana = 2;
      hitMonsterWithMagic(fakeGameTeam, null, attackTarget, 4);
      expect(attackTarget.health).toBe(MONSTER_HEALTH - 4);
    });

    it('fury does double damage to taunt', () => {
      attackTarget.armor = 0;
      attackingMonster.addAbility(Ability.FURY);
      attackTarget.addAbility(Ability.TAUNT);
      hitMonsterWithMagic(fakeGameTeam, attackingMonster, attackTarget, 4);
      expect(attackTarget.health).toBe(MONSTER_HEALTH - 8);
    });

    it('fury does nothing if no taunt', () => {
      attackTarget.armor = 0;
      attackingMonster.addAbility(Ability.FURY);
      hitMonsterWithMagic(fakeGameTeam, attackingMonster, attackTarget, 4);
      expect(attackTarget.health).toBe(MONSTER_HEALTH - 4);
    });

    it('does no damage and removes divine shield if target has divine shield', () => {
      attackTarget.addAbility(Ability.DIVINE_SHIELD);
      hitMonsterWithMagic(fakeGameTeam, null, attackTarget, 4);
      expect(attackTarget.health).toBe(MONSTER_HEALTH);
      expect(attackTarget.hasAbility(Ability.DIVINE_SHIELD)).toBe(false);
    });

    it('does correct damage if monster has void', () => {
      attackTarget.addAbility(Ability.VOID);
      hitMonsterWithMagic(fakeGameTeam, null, attackTarget, 1);
      expect(attackTarget.health).toBe(MONSTER_HEALTH);
      hitMonsterWithMagic(fakeGameTeam, null, attackTarget, 3);
      expect(attackTarget.health).toBe(MONSTER_HEALTH - 2);
    });

    it('hits armor if monster has void armor', () => {
      attackTarget.addAbility(Ability.VOID_ARMOR);
      hitMonsterWithMagic(fakeGameTeam, null, attackTarget, 1);
      expect(attackTarget.health).toBe(MONSTER_HEALTH);
      expect(attackTarget.armor).toBe(MONSTER_ARMOR - 1);
      hitMonsterWithMagic(fakeGameTeam, null, attackTarget, 100);
      expect(attackTarget.health).toBe(MONSTER_HEALTH);
      expect(attackTarget.armor).toBe(0);
    });

    it('hits correctly with void and void armor', () => {
      attackTarget.addAbility(Ability.VOID);
      attackTarget.addAbility(Ability.VOID_ARMOR);
      hitMonsterWithMagic(fakeGameTeam, null, attackTarget, 3);
      expect(attackTarget.health).toBe(MONSTER_HEALTH);
      expect(attackTarget.armor).toBe(MONSTER_ARMOR - 2);
    });

    it('hits correctly with no modifiers', () => {
      hitMonsterWithMagic(fakeGameTeam, null, attackTarget, 3);
      expect(attackTarget.health).toBe(MONSTER_HEALTH - 3);
      expect(attackTarget.armor).toBe(MONSTER_ARMOR);
    });
  });

  describe('hitMonsterWithPhysical function', () => {
    it('hits armor if it has any', () => {
      hitMonsterWithPhysical(fakeGameTeam, null, attackTarget, 3);
      expect(attackTarget.armor).toBe(MONSTER_ARMOR - 3);
      expect(attackTarget.health).toBe(MONSTER_HEALTH);
      hitMonsterWithPhysical(fakeGameTeam, null, attackTarget, 100);
      expect(attackTarget.armor).toBe(0);
      expect(attackTarget.health).toBe(MONSTER_HEALTH);
    });

    it('only does 1 damage if attack target has force field and attack is >= 5', () => {
      attackTarget.armor = 0;
      attackTarget.addAbility(Ability.FORCEFIELD);
      hitMonsterWithPhysical(fakeGameTeam, null, attackTarget, 5);
      expect(attackTarget.health).toBe(MONSTER_HEALTH - 1);
    });

    it('does full damage if attack target has force field and attack is < 5', () => {
      attackTarget.armor = 0;
      attackTarget.addAbility(Ability.FORCEFIELD);
      hitMonsterWithPhysical(fakeGameTeam, null, attackTarget, 4);
      expect(attackTarget.health).toBe(MONSTER_HEALTH - 4);
    });

    it('giant killer does double damage after force field reduces it if attack is >= 5', () => {
      attackTarget.armor = 0;
      attackingMonster.addAbility(Ability.GIANT_KILLER);
      attackTarget.mana = 11;
      attackTarget.addAbility(Ability.FORCEFIELD);
      hitMonsterWithPhysical(fakeGameTeam, attackingMonster, attackTarget, 10);
      expect(attackTarget.health).toBe(18);
    });

    it("giant killer does  double damage and force field doesn't reduce it if attack is < 5", () => {
      attackTarget.armor = 0;
      attackingMonster.addAbility(Ability.GIANT_KILLER);
      attackTarget.addAbility(Ability.FORCEFIELD);
      attackTarget.mana = 11;
      hitMonsterWithPhysical(fakeGameTeam, attackingMonster, attackTarget, 4);
      expect(attackTarget.health).toBe(MONSTER_HEALTH - 8);
    });

    it('giant killer does nothing if mana is < 10', () => {
      attackTarget.armor = 0;
      attackingMonster.addAbility(Ability.GIANT_KILLER);
      attackTarget.addAbility(Ability.FORCEFIELD);
      attackTarget.mana = 2;
      hitMonsterWithPhysical(fakeGameTeam, attackingMonster, attackTarget, 4);
      expect(attackTarget.health).toBe(MONSTER_HEALTH - 4);
    });

    it('fury does double damage to taunt', () => {
      attackTarget.armor = 0;
      attackingMonster.addAbility(Ability.FURY);
      attackTarget.addAbility(Ability.TAUNT);
      hitMonsterWithPhysical(fakeGameTeam, attackingMonster, attackTarget, 4);
      expect(attackTarget.health).toBe(MONSTER_HEALTH - 8);
    });

    it('fury does nothing if no taunt', () => {
      attackTarget.armor = 0;
      attackingMonster.addAbility(Ability.FURY);
      hitMonsterWithPhysical(fakeGameTeam, attackingMonster, attackTarget, 4);
      expect(attackTarget.health).toBe(MONSTER_HEALTH - 4);
    });

    it('does no damage and removes divine shield if target has divine shield', () => {
      attackTarget.addAbility(Ability.DIVINE_SHIELD);
      hitMonsterWithPhysical(fakeGameTeam, null, attackTarget, 4);
      expect(attackTarget.health).toBe(MONSTER_HEALTH);
      expect(attackTarget.hasAbility(Ability.DIVINE_SHIELD)).toBe(false);
    });

    it('does correct damage if monster has shield', () => {
      attackTarget.armor = 0;
      attackTarget.addAbility(Ability.SHIELD);
      hitMonsterWithPhysical(fakeGameTeam, null, attackTarget, 1);
      expect(attackTarget.health).toBe(MONSTER_HEALTH);
      hitMonsterWithPhysical(fakeGameTeam, null, attackTarget, 3);
      expect(attackTarget.health).toBe(MONSTER_HEALTH - 2);
    });
  });
});
