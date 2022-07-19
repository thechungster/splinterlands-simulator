import { Game } from '../game';
import { GameMonster } from '../game_monster';
import { Ability, CardStats } from '../types';
import { hitMonsterWithMagic, hitMonsterWithPhysical } from './damage_utils';
import { createFakeCardDetail } from './test_utils';
jest.mock('../game');

const MONSTER_MAGIC = 5;
const MONSTER_RANGED = 7;
const MONSTER_MELEE = 9;
const MONSTER_HEALTH = 5;
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
      hitMonsterWithMagic(fakeGameTeam, attackTarget, 5);
      expect(attackTarget.health).toBe(MONSTER_HEALTH - 1);
    });

    it('does full damage if attack target has force field and attack is < 5', () => {
      attackTarget.addAbility(Ability.FORCEFIELD);
      hitMonsterWithMagic(fakeGameTeam, attackTarget, 4);
      expect(attackTarget.health).toBe(MONSTER_HEALTH - 4);
    });

    it('does no damage and removes divine shield if target has divine shield', () => {
      attackTarget.addAbility(Ability.DIVINE_SHIELD);
      hitMonsterWithMagic(fakeGameTeam, attackTarget, 4);
      expect(attackTarget.health).toBe(MONSTER_HEALTH);
      expect(attackTarget.hasAbility(Ability.DIVINE_SHIELD)).toBe(false);
    });

    it('does correct damage if monster has void', () => {
      attackTarget.addAbility(Ability.VOID);
      hitMonsterWithMagic(fakeGameTeam, attackTarget, 1);
      expect(attackTarget.health).toBe(MONSTER_HEALTH);
      hitMonsterWithMagic(fakeGameTeam, attackTarget, 3);
      expect(attackTarget.health).toBe(MONSTER_HEALTH - 2);
    });

    it('hits armor if monster has void armor', () => {
      attackTarget.addAbility(Ability.VOID_ARMOR);
      hitMonsterWithMagic(fakeGameTeam, attackTarget, 1);
      expect(attackTarget.health).toBe(MONSTER_HEALTH);
      expect(attackTarget.armor).toBe(MONSTER_ARMOR - 1);
      hitMonsterWithMagic(fakeGameTeam, attackTarget, 100);
      expect(attackTarget.health).toBe(MONSTER_HEALTH);
      expect(attackTarget.armor).toBe(0);
    });

    it('hits correctly with void and void armor', () => {
      attackTarget.addAbility(Ability.VOID);
      attackTarget.addAbility(Ability.VOID_ARMOR);
      hitMonsterWithMagic(fakeGameTeam, attackTarget, 3);
      expect(attackTarget.health).toBe(MONSTER_HEALTH);
      expect(attackTarget.armor).toBe(MONSTER_ARMOR - 2);
    });

    it('hits correctly with no modifiers', () => {
      hitMonsterWithMagic(fakeGameTeam, attackTarget, 3);
      expect(attackTarget.health).toBe(MONSTER_HEALTH - 3);
      expect(attackTarget.armor).toBe(MONSTER_ARMOR);
    });
  });

  describe('hitMonsterWithPhysical function', () => {
    it('hits armor if it has any', () => {
      hitMonsterWithPhysical(fakeGameTeam, attackTarget, 3);
      expect(attackTarget.armor).toBe(MONSTER_ARMOR - 3);
      expect(attackTarget.health).toBe(MONSTER_HEALTH);
      hitMonsterWithPhysical(fakeGameTeam, attackTarget, 100);
      expect(attackTarget.armor).toBe(0);
      expect(attackTarget.health).toBe(MONSTER_HEALTH);
    });

    it('only does 1 damage if attack target has force field and attack is >= 5', () => {
      attackTarget.armor = 0;
      attackTarget.addAbility(Ability.FORCEFIELD);
      hitMonsterWithPhysical(fakeGameTeam, attackTarget, 5);
      expect(attackTarget.health).toBe(MONSTER_HEALTH - 1);
    });

    it('does full damage if attack target has force field and attack is < 5', () => {
      attackTarget.armor = 0;
      attackTarget.addAbility(Ability.FORCEFIELD);
      hitMonsterWithPhysical(fakeGameTeam, attackTarget, 4);
      expect(attackTarget.health).toBe(MONSTER_HEALTH - 4);
    });

    it('does no damage and removes divine shield if target has divine shield', () => {
      attackTarget.addAbility(Ability.DIVINE_SHIELD);
      hitMonsterWithPhysical(fakeGameTeam, attackTarget, 4);
      expect(attackTarget.health).toBe(MONSTER_HEALTH);
      expect(attackTarget.hasAbility(Ability.DIVINE_SHIELD)).toBe(false);
    });

    it('does correct damage if monster has shield', () => {
      attackTarget.armor = 0;
      attackTarget.addAbility(Ability.SHIELD);
      hitMonsterWithPhysical(fakeGameTeam, attackTarget, 1);
      expect(attackTarget.health).toBe(MONSTER_HEALTH);
      hitMonsterWithPhysical(fakeGameTeam, attackTarget, 3);
      expect(attackTarget.health).toBe(MONSTER_HEALTH - 2);
    });
  });
});
