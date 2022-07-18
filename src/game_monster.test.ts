import { GameMonster } from './game_monster';
import { Ability, CardStats } from './types';
import { PROTECT_AMOUNT } from './utils/ability_utils';
import { createFakeCardDetail } from './utils/test_utils';

const MONSTER_HEALTH = 5;
const MONSTER_STATS = {
  abilities: [],
  mana: 1,
  health: MONSTER_HEALTH,
  speed: 1,
  armor: 1,
  attack: 1,
  ranged: 1,
  magic: 1,
} as CardStats;

describe('GameMonster', () => {
  let monster: GameMonster;

  beforeEach(() => {
    const fakeCardDetail = createFakeCardDetail(MONSTER_STATS);
    monster = new GameMonster(fakeCardDetail, 1);
  });

  describe('debuffs', () => {
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

      expect(monster.getDebuffAmt(Ability.CRIPPLE)).toBe(2);
    });
  });

  describe('health', () => {
    describe('postAbilityMaxHealth function', () => {
      describe('with last stand active', () => {
        beforeEach(() => {
          monster.addAbility(Ability.LAST_STAND);
          monster.setIsOnlyMonster();
        });

        it('increases health by standard 1.5x if there are no buffs/debuffs', () => {
          expect(monster.getPostAbilityMaxHealth()).toBe(Math.ceil(1.5 * MONSTER_HEALTH));
        });

        it('life leech increased health is also affected by summoner health', () => {
          monster.addSummonerHealth(-1);
          expect(monster.getPostAbilityMaxHealth()).toBe(Math.ceil(1.5 * (MONSTER_HEALTH - 1)));
        });

        it('life leech increased health is also affected by last stand', () => {
          monster.addBuff(Ability.LIFE_LEECH);
          monster.addBuff(Ability.LIFE_LEECH);
          expect(monster.getPostAbilityMaxHealth()).toBe(Math.ceil(1.5 * (MONSTER_HEALTH + 2)));
        });

        it('scavenger increased health is also affected by last stand', () => {
          monster.addBuff(Ability.SCAVENGER);
          expect(monster.getPostAbilityMaxHealth()).toBe(Math.ceil(1.5 * (MONSTER_HEALTH + 1)));
        });

        // TODO: Unsure if this is true.
        it('cripple decreased health is affected by last stand', () => {
          monster.addDebuff(Ability.CRIPPLE);
          expect(monster.getPostAbilityMaxHealth()).toBe(Math.ceil(1.5 * (MONSTER_HEALTH - 1)));
        });

        // TODO: Unsure if this is true. But if this changes, so does strengthen test
        it('weaken decreased health is not affected by last stand', () => {
          monster.addDebuff(Ability.WEAKEN);
          expect(monster.getPostAbilityMaxHealth()).toBe(Math.ceil(1.5 * MONSTER_HEALTH) - 1);
        });

        // TODO: Unsure if this is true. But if this changes, so does weaken test
        it('strengthen increased health is not affected by last stand', () => {
          monster.addBuff(Ability.STRENGTHEN);
          expect(monster.getPostAbilityMaxHealth()).toBe(Math.ceil(1.5 * MONSTER_HEALTH) + 1);
        });
      });

      it('returns a minimum max health of 1', () => {
        monster.addSummonerHealth(-10);
        expect(monster.getPostAbilityMaxHealth()).toBe(1);
      });
    });

    describe('hitHealth function', () => {
      it('brings the monster to correct health after hitting it', () => {
        monster.hitHealth(2);
        expect(monster.health).toBe(MONSTER_HEALTH - 2);
      });

      it('returns the remaining damage after hitting health down to 0', () => {
        const remainder = monster.hitHealth(7);
        expect(remainder).toBe(7 - MONSTER_HEALTH);
      });
    });

    it("can't add health if monster is dead", () => {
      expect(monster.isAlive()).toBe(true);
      monster.hitHealth(5);
      monster.addHealth(1);
      expect(monster.isAlive()).toBe(false);
      expect(monster.health).toBe(0);
    });

    it('starting health is changed when summoner increases it', () => {
      monster.addSummonerHealth(2);
      expect(monster.startingHealth).toBe(MONSTER_HEALTH + 2);
    });

    it('starting health is changed when summoner decreases it', () => {
      monster.addSummonerHealth(-2);
      expect(monster.startingHealth).toBe(MONSTER_HEALTH - 2);
    });
  });

  describe('resurrect function', () => {
    beforeEach(() => {
      monster.hitHealth(MONSTER_HEALTH);
    });

    it('resurrects monster to 1 health', () => {
      monster.resurrect();
      expect(monster.health).toBe(1);
    });

    it('throws error if monster is not dead', () => {
      monster.addHealth(MONSTER_HEALTH);
      expect(monster.resurrect).toThrow();
    });

    it('resurrects the monster with divine shield if it had one', () => {
      monster.addAbility(Ability.DIVINE_SHIELD);
      monster.removeDivineShield();
      expect(monster.hasAbility(Ability.DIVINE_SHIELD)).toBe(false);
      monster.resurrect();
      expect(monster.hasAbility(Ability.DIVINE_SHIELD)).toBe(true);
    });

    it("resurrects without divine shield if it didn't originally have it", () => {
      monster.resurrect();
      expect(monster.hasAbility(Ability.DIVINE_SHIELD)).toBe(false);
    });

    it('resurrects with the max armor it can have', () => {
      monster.health = 1;
      monster.addSummonerArmor(-1);
      monster.addBuff(Ability.PROTECT);
      monster.armor = 0;
      monster.health = 0;
      monster.resurrect();
      expect(monster.armor).toBe(PROTECT_AMOUNT);
    });
  });
});
