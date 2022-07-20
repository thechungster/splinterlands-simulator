import { Game } from './game';
import { GameMonster } from './game_monster';
import { GameTeam } from './game_team';
import { Ability, AttackType, Ruleset } from './types';
import { THORNS_DAMAGE } from './utils/ability_utils';
import {
  DEFAULT_MONSTER_STAT,
  getDefaultFakeMonster,
  getDefaultFakeSummoner,
} from './utils/test_utils';
import * as abilityUtils from './utils/ability_utils';

/* Testing this with only the public methods would be like an integration test so access the private variables
 * and unit test them that way */
/* tslint:disable:no-string-literal */
describe('Game', () => {
  let game: Game;
  let teamOne: GameTeam;
  let teamTwo: GameTeam;
  let getSuccessBelowSpy: jest.SpyInstance;

  const createGame = () => {
    const summonerOne = getDefaultFakeSummoner();
    const summonerTwo = getDefaultFakeSummoner();
    const monstersOne = [getDefaultFakeMonster(), getDefaultFakeMonster(), getDefaultFakeMonster()];
    const monstersTwo = [getDefaultFakeMonster(), getDefaultFakeMonster(), getDefaultFakeMonster()];
    teamOne = new GameTeam(summonerOne, monstersOne);
    teamTwo = new GameTeam(summonerTwo, monstersTwo);
    game = new Game(teamOne, teamTwo, new Set<Ruleset>(), false);
    getSuccessBelowSpy = jest.spyOn(abilityUtils, 'getSuccessBelow');
  };

  beforeEach(() => {
    createGame();
  });

  afterEach(() => {
    getSuccessBelowSpy.mockClear();
  });

  describe('attacking applications', () => {
    let attackingMonster: GameMonster;
    let attackTarget: GameMonster;

    beforeEach(() => {
      attackingMonster = teamOne.getFirstAliveMonster();
      attackTarget = teamTwo.getFirstAliveMonster();
    });

    describe('maybeApplyThorns function', () => {
      beforeEach(() => {
        attackTarget.addAbility(Ability.THORNS);
      });

      it("doesn't do anything if attack type is not melee", () => {
        game['maybeApplyThorns'](attackingMonster, attackTarget, AttackType.RANGED);
        expect(attackingMonster).toHaveSameBasicStats(attackTarget);
        game['maybeApplyThorns'](attackingMonster, attackTarget, AttackType.MAGIC);
        expect(attackingMonster).toHaveSameBasicStats(attackTarget);
      });

      it("doesn't do anything if attack target has no thorns", () => {
        attackTarget.removeAbility(Ability.THORNS);
        game['maybeApplyThorns'](attackingMonster, attackTarget, AttackType.MELEE);
        expect(attackingMonster).toHaveSameBasicStats(attackTarget);
      });

      it("doesn't do anything if attacker has reflection shield", () => {
        attackingMonster.addAbility(Ability.REFLECTION_SHIELD);
        game['maybeApplyThorns'](attackingMonster, attackTarget, AttackType.MELEE);
        expect(attackingMonster).toHaveSameBasicStats(attackTarget);
      });

      it('attacker takes 2 damage if target has thorns', () => {
        game['maybeApplyThorns'](attackingMonster, attackTarget, AttackType.MELEE);
        expect(attackingMonster).not.toHaveSameBasicStats(attackTarget);
        expect(attackingMonster.armor).toBe(DEFAULT_MONSTER_STAT - THORNS_DAMAGE);
      });

      it('attacker takes 3 damage if target has thorns and attacker has amplify', () => {
        attackingMonster.addDebuff(Ability.AMPLIFY);
        game['maybeApplyThorns'](attackingMonster, attackTarget, AttackType.MELEE);
        expect(attackingMonster).not.toHaveSameBasicStats(attackTarget);
        expect(attackingMonster.armor).toBe(DEFAULT_MONSTER_STAT - THORNS_DAMAGE - 1);
      });

      it('attacker takes 1 damage if target has thorns and attacking has shield', () => {
        attackingMonster.addAbility(Ability.SHIELD);
        game['maybeApplyThorns'](attackingMonster, attackTarget, AttackType.MELEE);
        expect(attackingMonster).not.toHaveSameBasicStats(attackTarget);
        expect(attackingMonster.armor).toBe(DEFAULT_MONSTER_STAT - THORNS_DAMAGE / 2);
      });
    });

    describe('maybeApplyMagicReflect function', () => {
      beforeEach(() => {
        attackTarget.addAbility(Ability.MAGIC_REFLECT);
      });

      it("doesn't do anything if attack type is not magic", () => {
        game['maybeApplyMagicReflect'](attackingMonster, attackTarget, AttackType.RANGED, 3);
        expect(attackingMonster).toHaveSameBasicStats(attackTarget);
        game['maybeApplyMagicReflect'](attackingMonster, attackTarget, AttackType.MELEE, 3);
        expect(attackingMonster).toHaveSameBasicStats(attackTarget);
      });

      it("doesn't do anything if attack target has no magic reflect", () => {
        attackTarget.removeAbility(Ability.MAGIC_REFLECT);
        game['maybeApplyMagicReflect'](attackingMonster, attackTarget, AttackType.MAGIC, 3);
        expect(attackingMonster).toHaveSameBasicStats(attackTarget);
      });

      it("doesn't do anything if attacker has reflection shield", () => {
        attackingMonster.addAbility(Ability.REFLECTION_SHIELD);
        game['maybeApplyMagicReflect'](attackingMonster, attackTarget, AttackType.MAGIC, 3);
        expect(attackingMonster).toHaveSameBasicStats(attackTarget);
      });

      it('attacker takes half of magic damage rounded up', () => {
        game['maybeApplyMagicReflect'](attackingMonster, attackTarget, AttackType.MAGIC, 3);
        expect(attackingMonster).not.toHaveSameBasicStats(attackTarget);
        expect(attackingMonster.health).toBe(DEFAULT_MONSTER_STAT - 2);
      });

      it('attacker takes an additional damage if target has magic reflect and attacker has amplify', () => {
        attackingMonster.addDebuff(Ability.AMPLIFY);
        game['maybeApplyMagicReflect'](attackingMonster, attackTarget, AttackType.MAGIC, 3);
        expect(attackingMonster).not.toHaveSameBasicStats(attackTarget);
        expect(attackingMonster.health).toBe(DEFAULT_MONSTER_STAT - 3);
      });

      it('attacker takes 1 damage if target has magic reflect and attacking has void', () => {
        attackingMonster.addAbility(Ability.VOID);
        game['maybeApplyMagicReflect'](attackingMonster, attackTarget, AttackType.MAGIC, 3);
        expect(attackingMonster.health).toBe(DEFAULT_MONSTER_STAT - 1);
      });
    });

    describe('maybeApplyReturnFire function', () => {
      beforeEach(() => {
        attackTarget.addAbility(Ability.RETURN_FIRE);
      });

      it("doesn't do anything if attack type is not ranged", () => {
        game['maybeApplyReturnFire'](attackingMonster, attackTarget, AttackType.MAGIC, 3);
        expect(attackingMonster).toHaveSameBasicStats(attackTarget);
        game['maybeApplyReturnFire'](attackingMonster, attackTarget, AttackType.MELEE, 3);
        expect(attackingMonster).toHaveSameBasicStats(attackTarget);
      });

      it("doesn't do anything if attack target has no return fire", () => {
        attackTarget.removeAbility(Ability.RETURN_FIRE);
        game['maybeApplyReturnFire'](attackingMonster, attackTarget, AttackType.RANGED, 3);
        expect(attackingMonster).toHaveSameBasicStats(attackTarget);
      });

      it("doesn't do anything if attacker has reflection shield", () => {
        attackingMonster.addAbility(Ability.REFLECTION_SHIELD);
        game['maybeApplyReturnFire'](attackingMonster, attackTarget, AttackType.RANGED, 3);
        expect(attackingMonster).toHaveSameBasicStats(attackTarget);
      });

      it('attacker takes half of ranged damage rounded up', () => {
        game['maybeApplyReturnFire'](attackingMonster, attackTarget, AttackType.RANGED, 3);
        expect(attackingMonster).not.toHaveSameBasicStats(attackTarget);
        expect(attackingMonster.armor).toBe(DEFAULT_MONSTER_STAT - 2);
      });

      it('attacker takes an additional damage if target has return fire and attacker has amplify', () => {
        attackingMonster.addDebuff(Ability.AMPLIFY);
        game['maybeApplyReturnFire'](attackingMonster, attackTarget, AttackType.RANGED, 3);
        expect(attackingMonster).not.toHaveSameBasicStats(attackTarget);
        expect(attackingMonster.armor).toBe(DEFAULT_MONSTER_STAT - 3);
      });

      it('attacker takes 1 damage if target has return fire and attacking has shield', () => {
        attackingMonster.addAbility(Ability.SHIELD);
        game['maybeApplyReturnFire'](attackingMonster, attackTarget, AttackType.RANGED, 3);
        expect(attackingMonster.armor).toBe(DEFAULT_MONSTER_STAT - 1);
      });
    });

    describe('maybeRetaliate function', () => {
      let attackMonsterPhaseSpy: jest.SpyInstance;

      beforeEach(() => {
        attackMonsterPhaseSpy = jest.spyOn<any, any>(Game.prototype, 'attackMonsterPhase');
        attackTarget.addAbility(Ability.RETALIATE);
      });

      it('does nothing if monster has no retaliate', () => {
        attackTarget.removeAbility(Ability.RETALIATE);
        game['maybeRetaliate'](attackingMonster, attackTarget, AttackType.MELEE);
        expect(getSuccessBelowSpy).not.toHaveBeenCalled();
      });

      it('does nothing if attack type is not melee', () => {
        game['maybeRetaliate'](attackingMonster, attackTarget, AttackType.RANGED);
        expect(getSuccessBelowSpy).not.toHaveBeenCalled();
        game['maybeRetaliate'](attackingMonster, attackTarget, AttackType.MAGIC);
        expect(getSuccessBelowSpy).not.toHaveBeenCalled();
      });

      it('does nothing if roll fails', () => {
        getSuccessBelowSpy.mockReturnValueOnce(false);
        game['maybeRetaliate'](attackingMonster, attackTarget, AttackType.MELEE);
        expect(getSuccessBelowSpy).toHaveBeenCalledWith(50);
        expect(attackMonsterPhaseSpy).not.toHaveBeenCalled();
        expect(attackTarget).toHaveSameBasicStats(attackingMonster);
      });

      it('attacks the monster back if rolls successfully', () => {
        getSuccessBelowSpy.mockReturnValueOnce(true);
        game['maybeRetaliate'](attackingMonster, attackTarget, AttackType.MELEE);
        expect(getSuccessBelowSpy).toHaveBeenCalledWith(50);
        expect(attackMonsterPhaseSpy).toHaveBeenCalledWith(
          attackTarget,
          attackingMonster,
          AttackType.MELEE,
        );
        expect(attackTarget).not.toHaveSameBasicStats(attackingMonster);
      });
    });

    describe('maybeApplyStun function', () => {
      beforeEach(() => {
        attackingMonster.addAbility(Ability.STUN);
      });

      it('does nothing if attacker has no stun', () => {
        attackingMonster.removeAbility(Ability.STUN);
        game['maybeApplyStun'](attackingMonster, attackTarget);
        expect(getSuccessBelowSpy).not.toHaveBeenCalled();
      });

      it('does nothing if roll fails', () => {
        getSuccessBelowSpy.mockReturnValueOnce(false);
        game['maybeApplyStun'](attackingMonster, attackTarget);
        expect(getSuccessBelowSpy).toHaveBeenCalledWith(50);
        expect(attackTarget.hasDebuff(Ability.STUN)).toBe(false);
      });

      it('applies stun to monster if roll successful', () => {
        getSuccessBelowSpy.mockReturnValueOnce(true);
        game['maybeApplyStun'](attackingMonster, attackTarget);
        expect(getSuccessBelowSpy).toHaveBeenCalledWith(50);
        expect(attackTarget.hasDebuff(Ability.STUN)).toBe(true);
      });
    });

    describe('maybeApplyPoison function', () => {
      beforeEach(() => {
        attackingMonster.addAbility(Ability.POISON);
      });

      it('does nothing if attacker has no poison', () => {
        attackingMonster.removeAbility(Ability.POISON);
        game['maybeApplyPoison'](attackingMonster, attackTarget);
        expect(getSuccessBelowSpy).not.toHaveBeenCalled();
      });

      it('does nothing if roll fails', () => {
        getSuccessBelowSpy.mockReturnValueOnce(false);
        game['maybeApplyPoison'](attackingMonster, attackTarget);
        expect(getSuccessBelowSpy).toHaveBeenCalledWith(50);
        expect(attackTarget.hasDebuff(Ability.POISON)).toBe(false);
      });

      it('applies stun to monster if roll successful', () => {
        getSuccessBelowSpy.mockReturnValueOnce(true);
        game['maybeApplyPoison'](attackingMonster, attackTarget);
        expect(getSuccessBelowSpy).toHaveBeenCalledWith(50);
        expect(attackTarget.hasDebuff(Ability.POISON)).toBe(true);
      });
    });

    describe('maybeApplyCripple function', () => {
      beforeEach(() => {
        attackingMonster.addAbility(Ability.CRIPPLE);
      });

      it('does nothing if attacker has no cripple', () => {
        attackingMonster.removeAbility(Ability.CRIPPLE);
        game['maybeApplyCripple'](attackingMonster, attackTarget);
        expect(attackTarget.hasDebuff(Ability.CRIPPLE)).toBe(false);
      });

      it('applies cripple debuff to monster', () => {
        game['maybeApplyCripple'](attackingMonster, attackTarget);
        expect(attackTarget.getDebuffAmt(Ability.CRIPPLE)).toBe(1);
        game['maybeApplyCripple'](attackingMonster, attackTarget);
        expect(attackTarget.getDebuffAmt(Ability.CRIPPLE)).toBe(2);
      });
    });

    describe('maybeApplyHalving function', () => {
      beforeEach(() => {
        attackingMonster.addAbility(Ability.HALVING);
      });

      it('does nothing if attacker has no havling', () => {
        attackingMonster.removeAbility(Ability.HALVING);
        game['maybeApplyHalving'](attackingMonster, attackTarget);
        expect(attackTarget.hasDebuff(Ability.HALVING)).toBe(false);
      });

      it('applies halving debuff to monster, does not stack', () => {
        game['maybeApplyHalving'](attackingMonster, attackTarget);
        expect(attackTarget.getDebuffAmt(Ability.HALVING)).toBe(1);
        game['maybeApplyHalving'](attackingMonster, attackTarget);
        expect(attackTarget.getDebuffAmt(Ability.HALVING)).toBe(1);
      });
    });

    describe('maybeApplyBloodlust function', () => {
      beforeEach(() => {
        attackingMonster.addAbility(Ability.BLOODLUST);
      });

      it('does nothing if attacker has no bloodlust', () => {
        attackingMonster.removeAbility(Ability.BLOODLUST);
        const clonedMonster = attackingMonster.clone() as GameMonster;
        game['maybeApplyBloodlust'](attackingMonster, false);
        expect(attackingMonster).toHaveSameBasicStats(clonedMonster);
      });

      it('increases stats by 1 each', () => {
        game['maybeApplyBloodlust'](attackingMonster, false);
        expect(attackingMonster.magic).toBe(DEFAULT_MONSTER_STAT + 1);
        expect(attackingMonster.ranged).toBe(DEFAULT_MONSTER_STAT + 1);
        expect(attackingMonster.melee).toBe(DEFAULT_MONSTER_STAT + 1);
        expect(attackingMonster.health).toBe(DEFAULT_MONSTER_STAT + 1);
        expect(attackingMonster.speed).toBe(DEFAULT_MONSTER_STAT + 1);
        expect(attackingMonster.armor).toBe(DEFAULT_MONSTER_STAT + 1);
      });

      it("doesn't increase attack stats if they were previously 0", () => {
        attackingMonster.ranged = 0;
        attackingMonster.magic = 0;
        game['maybeApplyBloodlust'](attackingMonster, false);
        expect(attackingMonster.magic).toBe(0);
        expect(attackingMonster.ranged).toBe(0);
        expect(attackingMonster.melee).toBe(DEFAULT_MONSTER_STAT + 1);
        expect(attackingMonster.health).toBe(DEFAULT_MONSTER_STAT + 1);
        expect(attackingMonster.speed).toBe(DEFAULT_MONSTER_STAT + 1);
        expect(attackingMonster.armor).toBe(DEFAULT_MONSTER_STAT + 1);
      });

      it('decreases speed by 1 in reverse speed', () => {
        game['maybeApplyBloodlust'](attackingMonster, true);
        expect(attackingMonster.magic).toBe(DEFAULT_MONSTER_STAT + 1);
        expect(attackingMonster.ranged).toBe(DEFAULT_MONSTER_STAT + 1);
        expect(attackingMonster.melee).toBe(DEFAULT_MONSTER_STAT + 1);
        expect(attackingMonster.health).toBe(DEFAULT_MONSTER_STAT + 1);
        expect(attackingMonster.speed).toBe(DEFAULT_MONSTER_STAT - 1);
        expect(attackingMonster.armor).toBe(DEFAULT_MONSTER_STAT + 1);
      });
    });

    describe('maybeLifeLeech function', () => {
      beforeEach(() => {
        attackingMonster.addAbility(Ability.LIFE_LEECH);
      });

      it('does nothing if attacker has no life leech', () => {
        attackingMonster.removeAbility(Ability.LIFE_LEECH);
        game['maybeLifeLeech'](attackingMonster, 2);
        expect(attackingMonster.hasBuff(Ability.LIFE_LEECH)).toBe(false);
      });

      it('gives life leech buff to monster, increases health by half the damage. stacks', () => {
        game['maybeLifeLeech'](attackingMonster, 3);
        expect(attackingMonster.getBuffAmt(Ability.LIFE_LEECH)).toBe(2);
        expect(attackingMonster.health).toBe(DEFAULT_MONSTER_STAT + 2);
        game['maybeLifeLeech'](attackingMonster, 1);
        expect(attackingMonster.getBuffAmt(Ability.LIFE_LEECH)).toBe(3);
        expect(attackingMonster.health).toBe(DEFAULT_MONSTER_STAT + 3);
      });
    });
  });
});
