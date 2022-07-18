import { GameMonster } from './game_monster';
import { Ability } from './types';
import { createFakeCardDetail } from './utils/test_utils';

describe('GameMonster', () => {
  describe('debuffs', () => {
    let monster: GameMonster;

    beforeEach(() => {
      const fakeCardDetail = createFakeCardDetail([], 1, 1, 1, 1, 1, 1, 1);
      monster = new GameMonster(fakeCardDetail, 1);
    });

    it('adds a debuff when applied', () => {
      monster.addDebuff(Ability.BLIND);
      expect(monster.getDebuffAmt(Ability.BLIND)).toBe(1);
    });

    it("Doesn't add debuffs if monster has immunity", () => {
      monster.addAbility(Ability.IMMUNITY);
      monster.addDebuff(Ability.STUN);
      expect(monster.hasDebuff(Ability.STUN)).toBe(false);
    });

    it('Adds amplify debuff even if monster has immunity', () => {
      monster.addAbility(Ability.IMMUNITY);
      monster.addDebuff(Ability.AMPLIFY);
      expect(monster.hasDebuff(Ability.AMPLIFY)).toBe(true);
    });

    it('cleanse only removes all debuffs', () => {
      monster.addDebuff(Ability.STUN);
      monster.addDebuff(Ability.BLIND);
      monster.addDebuff(Ability.POISON);

      const allDebuffs = monster.getDebuffs();
      expect(allDebuffs.size).toBe(3);
      monster.cleanseDebuffs();

      expect(allDebuffs.size).toBe(0);
    });

    it('cleanse can only remove one cripple at a time', () => {
      monster.addDebuff(Ability.CRIPPLE);
      monster.addDebuff(Ability.CRIPPLE);
      monster.addDebuff(Ability.CRIPPLE);

      expect(monster.getDebuffAmt(Ability.CRIPPLE)).toBe(3);
      monster.cleanseDebuffs();

      expect(monster.getDebuffAmt(Ability.CRIPPLE)).toBe(1);
    });
  });
});
