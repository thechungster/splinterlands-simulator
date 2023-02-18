import { CardStats } from 'splinterlands-types';
import { GameMonster } from './game_monster';
import { Ability, AttackType } from './types';

import {
  ENRAGE_MULTIPLIER,
  LAST_STAND_MULTIPLIER,
  PROTECT_AMOUNT,
  RUST_AMOUNT,
} from './utils/ability_utils';
import { createFakeCardDetail, DEFAULT_MONSTER_STAT } from './utils/test_utils';

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

describe('GameMonster', () => {
  let monster: GameMonster;

  beforeEach(() => {
    const fakeCardDetail = createFakeCardDetail(MONSTER_STATS);
    monster = new GameMonster(fakeCardDetail, 1);
  });

  it('sets correct card position', () => {
    monster.setCardPosition(3);
    expect(monster.getCardPosition()).toBe(3);
  });

  it('isAlive function returns true when health is above 0', () => {
    monster.health = 1;
    expect(monster.isAlive()).toBe(true);
  });

  it('isAlive function returns false when heatlh is 0', () => {
    monster.health = 0;
    expect(monster.isAlive()).toBe(false);
  });

  it('passes turn correctly', () => {
    expect(monster.getHasTurnPassed()).toBe(false);
    monster.setHasTurnPassed(true);
    expect(monster.getHasTurnPassed()).toBe(true);
  });

  it('sets is last monster correctly', () => {
    expect(monster.isLastMonster()).toBe(false);
    monster.setIsOnlyMonster();
    expect(monster.isLastMonster()).toBe(true);
  });

  it('getCleanCard returns a card without any modifiers', () => {
    monster.health = 100;
    const cleanCard = monster.getCleanCard();
    expect(cleanCard.health).toBe(MONSTER_HEALTH);
  });

  describe('hasAction function', () => {
    describe('melee only card', () => {
      beforeEach(() => {
        const pureMeleeCard = {
          abilities: [],
          mana: 1,
          health: MONSTER_HEALTH,
          speed: 1,
          armor: MONSTER_ARMOR,
          attack: 1,
          ranged: 0,
          magic: 0,
        } as CardStats;
        const meleeCardDetail = createFakeCardDetail(pureMeleeCard);
        monster = new GameMonster(meleeCardDetail, 0);
      });

      it('returns true if in first position', () => {
        monster.setCardPosition(0);
        expect(monster.hasAction()).toBe(true);
      });

      it('returns false if not in first position with no abilities', () => {
        monster.setCardPosition(2);
        expect(monster.hasAction()).toBe(false);
      });

      it('returns true if not in first position with opportunity', () => {
        monster.setCardPosition(2);
        monster.addAbility(Ability.OPPORTUNITY);
        expect(monster.hasAction()).toBe(true);
      });

      it('returns true if not in first position with opportunity', () => {
        monster.setCardPosition(2);
        monster.addAbility(Ability.OPPORTUNITY);
        expect(monster.hasAction()).toBe(true);
      });

      it('returns true if not in first position with sneak', () => {
        monster.setCardPosition(2);
        monster.addAbility(Ability.SNEAK);
        expect(monster.hasAction()).toBe(true);
      });

      it('returns true if not in first position and is melee mayhem ruleset', () => {
        monster.setCardPosition(2);
        monster.addAbility(Ability.MELEE_MAYHEM);
        expect(monster.hasAction()).toBe(true);
      });

      it('returns false if in 3rd position with reach', () => {
        monster.setCardPosition(2);
        monster.addAbility(Ability.REACH);
        expect(monster.hasAction()).toBe(false);
      });

      it('returns true if in 2nd position with reach', () => {
        monster.setCardPosition(1);
        monster.addAbility(Ability.REACH);
        expect(monster.hasAction()).toBe(true);
      });
    });

    describe('magic only card', () => {
      beforeEach(() => {
        const pureMagicCard = {
          abilities: [],
          mana: 1,
          health: MONSTER_HEALTH,
          speed: 1,
          armor: MONSTER_ARMOR,
          attack: 0,
          ranged: 0,
          magic: 1,
        } as CardStats;
        const magicCardDetail = createFakeCardDetail(pureMagicCard);
        monster = new GameMonster(magicCardDetail, 0);
      });

      it('returns true if in first position', () => {
        monster.setCardPosition(0);
        expect(monster.hasAction()).toBe(true);
      });

      it('returns true if not in first position', () => {
        monster.setCardPosition(3);
        expect(monster.hasAction()).toBe(true);
      });
    });

    describe('ranged only card', () => {
      beforeEach(() => {
        const pureRangedCard = {
          abilities: [],
          mana: 1,
          health: MONSTER_HEALTH,
          speed: 1,
          armor: MONSTER_ARMOR,
          attack: 0,
          ranged: 1,
          magic: 0,
        } as CardStats;
        const rangedCardDetail = createFakeCardDetail(pureRangedCard);
        monster = new GameMonster(rangedCardDetail, 0);
      });

      it('returns false if in first position', () => {
        monster.setCardPosition(0);
        expect(monster.hasAction()).toBe(false);
      });

      it('returns true if not in first position', () => {
        monster.setCardPosition(3);
        expect(monster.hasAction()).toBe(true);
      });
    });

    describe('no attack monster', () => {
      beforeEach(() => {
        const noAttackCard = {
          abilities: [],
          mana: 1,
          health: MONSTER_HEALTH,
          speed: 1,
          armor: MONSTER_ARMOR,
          attack: 0,
          ranged: 0,
          magic: 0,
        } as CardStats;
        const noAttackCardDetail = createFakeCardDetail(noAttackCard);
        monster = new GameMonster(noAttackCardDetail, 0);
      });

      it('returns false if has no abilities in first position', () => {
        monster.setCardPosition(0);
        expect(monster.hasAction()).toBe(false);
      });

      it('returns false if has no abilities in not first position', () => {
        monster.setCardPosition(3);
        expect(monster.hasAction()).toBe(false);
      });

      it('returns true if has tank heal', () => {
        monster.setCardPosition(1);
        monster.addAbility(Ability.TANK_HEAL);
        expect(monster.hasAction()).toBe(true);
      });

      it('returns true if has repair', () => {
        monster.setCardPosition(3);
        monster.addAbility(Ability.REPAIR);
        expect(monster.hasAction()).toBe(true);
      });
    });
  });

  describe('debuffs', () => {
    it("doesn't add a debuff when monster is dead", () => {
      monster.health = 0;
      monster.addDebuff(Ability.BLIND);
      expect(monster.hasDebuff(Ability.BLIND)).toBe(false);
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

    // https://docs.splinterlands.com/platform/release-notes
    // "A fix was applied to the Cripple ability os that it is no longer removed by Cleanse ability"
    it("cleanse doesn't remove CRIPPLE", () => {
      monster.addDebuff(Ability.CRIPPLE);
      monster.addDebuff(Ability.CRIPPLE);
      monster.addDebuff(Ability.CRIPPLE);
      monster.health = DEFAULT_MONSTER_STAT - 3;

      expect(monster.getDebuffAmt(Ability.CRIPPLE)).toBe(3);
      monster.cleanseDebuffs();

      expect(monster.health).toBe(DEFAULT_MONSTER_STAT - 3);
      expect(monster.getDebuffAmt(Ability.CRIPPLE)).toBe(3);
    });

    it('adding weaken removes a health', () => {
      monster.addDebuff(Ability.WEAKEN);
      expect(monster.health).toBe(MONSTER_HEALTH - 1);
    });

    it('removing weaken adds a health back', () => {
      monster.addDebuff(Ability.WEAKEN);
      monster.removeDebuff(Ability.WEAKEN);
      expect(monster.health).toBe(MONSTER_HEALTH);
    });

    it('adding cripple removes a health', () => {
      monster.addDebuff(Ability.WEAKEN);
      expect(monster.health).toBe(MONSTER_HEALTH - 1);
    });

    it('removing cripple adds a health back', () => {
      monster.health = 1;
      monster.addDebuff(Ability.CRIPPLE);
      monster.removeDebuff(Ability.CRIPPLE);
      expect(monster.health).toBe(2);
    });

    it('adding rust removes 2 armor', () => {
      monster.armor = 5;
      monster.addDebuff(Ability.RUST);
      expect(monster.armor).toBe(3);
    });

    it('adding rust sets armor to minimum of 0', () => {
      monster.armor = 1;
      monster.addDebuff(Ability.RUST);
      expect(monster.armor).toBe(0);
    });

    it('removing rust adds armor back', () => {
      monster.addSummonerArmor(4);
      monster.armor = 0;
      monster.addDebuff(Ability.RUST);
      monster.removeDebuff(Ability.RUST);
      expect(monster.armor).toBe(2);
    });

    it('removing rust adds armor only back to the max armor', () => {
      monster.addSummonerArmor(4 - MONSTER_ARMOR);
      monster.addDebuff(Ability.RUST);
      monster.armor = 3;
      monster.removeDebuff(Ability.RUST);
      expect(monster.armor).toBe(4);
    });
  });

  describe('buffs', () => {
    describe('removeBuff function', () => {
      it("does nothing if the monster doesn't have the buff", () => {
        monster.removeBuff(Ability.SCAVENGER);
        expect(monster.health).toBe(MONSTER_HEALTH);
      });

      it('removes health if scavenger buff is removed', () => {
        monster.addBuff(Ability.SCAVENGER);
        monster.health = 2;
        monster.removeBuff(Ability.SCAVENGER);
        expect(monster.health).toBe(1);
      });

      it("doesn't remove health if scavenger buff is removed and health is already 1", () => {
        monster.addBuff(Ability.SCAVENGER);
        monster.health = 1;
        monster.removeBuff(Ability.SCAVENGER);
        expect(monster.health).toBe(1);
      });

      it('removes health if life leech buff is removed', () => {
        monster.addBuff(Ability.LIFE_LEECH);
        monster.health = 2;
        monster.removeBuff(Ability.LIFE_LEECH);
        expect(monster.health).toBe(1);
      });

      it("doesn't remove health if life leech buff is removed and health is already 1", () => {
        monster.addBuff(Ability.LIFE_LEECH);
        monster.health = 1;
        monster.removeBuff(Ability.LIFE_LEECH);
        expect(monster.health).toBe(1);
      });

      it("doesn't remove health if strenghten buff is removed and mosnter was hurt", () => {
        monster.addBuff(Ability.STRENGTHEN);
        monster.health = 2;
        monster.removeBuff(Ability.STRENGTHEN);
        expect(monster.health).toBe(2);
      });

      it('removes health if monster is at max post ability health when removed', () => {
        monster.addBuff(Ability.STRENGTHEN);
        expect(monster.health).toBe(MONSTER_HEALTH + 1);
        monster.removeBuff(Ability.STRENGTHEN);
        expect(monster.health).toBe(MONSTER_HEALTH);
      });

      it('sets armor down when removing protect and armor is higher than max', () => {
        monster.addBuff(Ability.PROTECT);
        monster.armor = MONSTER_ARMOR + 1;
        monster.removeBuff(Ability.PROTECT);
        expect(monster.armor).toBe(MONSTER_ARMOR);
      });

      it("doesn't change armor when removing protect and armor is lower than max", () => {
        monster.addBuff(Ability.PROTECT);
        monster.armor = 2;
        monster.removeBuff(Ability.PROTECT);
        expect(monster.armor).toBe(2);
      });
    });

    describe('addBuff function', () => {
      it("doesn't add buff if monster is not alive", () => {
        monster.health = 0;
        monster.addBuff(Ability.SCAVENGER);
        expect(monster.hasBuff(Ability.SCAVENGER)).toBe(false);
      });

      it('adds buff normally if monster is alive', () => {
        monster.addBuff(Ability.SCAVENGER);
        expect(monster.hasBuff(Ability.SCAVENGER)).toBe(true);
      });

      it('adds health if adding scavenger buff', () => {
        monster.addBuff(Ability.SCAVENGER);
        expect(monster.health).toBe(MONSTER_HEALTH + 1);
      });

      it('adds health if adding life leech buff', () => {
        monster.addBuff(Ability.LIFE_LEECH);
        expect(monster.health).toBe(MONSTER_HEALTH + 1);
      });

      it('adds health if adding strengthen buff', () => {
        monster.addBuff(Ability.STRENGTHEN);
        expect(monster.health).toBe(MONSTER_HEALTH + 1);
      });

      it('adds 2 armor if adding protect buff', () => {
        monster.addBuff(Ability.PROTECT);
        expect(monster.armor).toBe(MONSTER_ARMOR + PROTECT_AMOUNT);
      });
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

        it('weaken decreased health is not affected by last stand', () => {
          monster.addDebuff(Ability.WEAKEN);
          expect(monster.getPostAbilityMaxHealth()).toBe(Math.ceil(1.5 * (MONSTER_HEALTH - 1)));
        });

        it('strengthen increased health is not affected by last stand', () => {
          monster.addBuff(Ability.STRENGTHEN);
          expect(monster.getPostAbilityMaxHealth()).toBe(Math.ceil(1.5 * (MONSTER_HEALTH + 1)));
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
      monster.addSummonerArmor(-1 * MONSTER_ARMOR);
      monster.addBuff(Ability.PROTECT);
      monster.armor = 0;
      monster.health = 0;
      monster.resurrect();
      expect(monster.armor).toBe(PROTECT_AMOUNT);
    });
  });

  describe('armor', () => {
    describe('addSummonerArmor function', () => {
      it('increases armor by correct amount', () => {
        monster.addSummonerArmor(2);
        expect(monster.armor).toBe(MONSTER_ARMOR + 2);
      });

      it('decreases armor to min of 0', () => {
        monster.addSummonerArmor(MONSTER_ARMOR * -1 - 1);
        expect(monster.armor).toBe(0);
      });
    });

    describe('getPostAbilityMaxArmor function', () => {
      describe('with lastStand active', () => {
        beforeEach(() => {
          monster.addAbility(Ability.LAST_STAND);
          monster.setIsOnlyMonster();
        });

        it('returns correct armor with no other modifiers', () => {
          expect(monster.getPostAbilityMaxArmor()).toBe(
            Math.ceil(MONSTER_ARMOR * LAST_STAND_MULTIPLIER),
          );
        });

        it('returns correct armor with summoner armor modifiers', () => {
          monster.addSummonerArmor(2);
          const lastStandArmor = Math.ceil(MONSTER_ARMOR * LAST_STAND_MULTIPLIER);
          expect(monster.getPostAbilityMaxArmor()).toBe(lastStandArmor + 2);
        });

        it('returns correct armor with protect', () => {
          monster.addBuff(Ability.PROTECT);
          monster.addBuff(Ability.PROTECT);
          const lastStandArmor = Math.ceil(MONSTER_ARMOR * LAST_STAND_MULTIPLIER);
          expect(monster.getPostAbilityMaxArmor()).toBe(lastStandArmor + PROTECT_AMOUNT * 2);
        });

        it('returns correct armor with rust', () => {
          monster.addDebuff(Ability.RUST);
          monster.addDebuff(Ability.RUST);
          const lastStandArmor = Math.ceil(MONSTER_ARMOR * LAST_STAND_MULTIPLIER);
          expect(monster.getPostAbilityMaxArmor()).toBe(lastStandArmor - RUST_AMOUNT * 2);
        });

        it('returns correct armor with all modifiers', () => {
          monster.addBuff(Ability.PROTECT);
          monster.addBuff(Ability.PROTECT);
          monster.addDebuff(Ability.RUST);
          monster.addSummonerArmor(-1);
          const lastStandArmor = Math.ceil(MONSTER_ARMOR * LAST_STAND_MULTIPLIER);
          const expectedArmor = lastStandArmor + PROTECT_AMOUNT * 2 - RUST_AMOUNT - 1;
          expect(monster.getPostAbilityMaxArmor()).toBe(expectedArmor);
        });
      });

      describe('with no last stand modifier', () => {
        it('returns correct armor with no other modifiers', () => {
          expect(monster.getPostAbilityMaxArmor()).toBe(MONSTER_ARMOR);
        });

        it('returns correct armor with summoner armor modifiers', () => {
          monster.addSummonerArmor(2);
          expect(monster.getPostAbilityMaxArmor()).toBe(MONSTER_ARMOR + 2);
        });

        it('returns correct armor with protect', () => {
          monster.addBuff(Ability.PROTECT);
          expect(monster.getPostAbilityMaxArmor()).toBe(MONSTER_ARMOR + PROTECT_AMOUNT);
        });

        it('returns correct armor with rust', () => {
          monster.addDebuff(Ability.RUST);
          expect(monster.getPostAbilityMaxArmor()).toBe(MONSTER_ARMOR - RUST_AMOUNT);
        });

        it('returns correct armor with all modifiers', () => {
          monster.addBuff(Ability.PROTECT);
          monster.addBuff(Ability.PROTECT);
          monster.addDebuff(Ability.RUST);
          monster.addSummonerArmor(-1);
          const expectedArmor = MONSTER_ARMOR + PROTECT_AMOUNT * 2 - RUST_AMOUNT - 1;
          expect(monster.getPostAbilityMaxArmor()).toBe(expectedArmor);
        });

        it('returns minimum of 0', () => {
          monster.addSummonerArmor(-10);
          expect(monster.getPostAbilityMaxArmor()).toBe(0);
        });
      });
    });
  });

  describe('speed', () => {
    describe('with last stand active', () => {
      beforeEach(() => {
        monster.addAbility(Ability.LAST_STAND);
        monster.setIsOnlyMonster();
      });

      it('returns correct speed with no other modifiers', () => {
        expect(monster.getPostAbilitySpeed()).toBe(
          Math.ceil(MONSTER_SPEED * LAST_STAND_MULTIPLIER),
        );
      });

      it('returns correct speed with summoner speed modifiers', () => {
        monster.addSummonerSpeed(2);
        const expectedSpeed = Math.ceil((MONSTER_SPEED + 2) * LAST_STAND_MULTIPLIER);
        expect(monster.getPostAbilitySpeed()).toBe(expectedSpeed);
      });

      it('returns correct speed with enrage ability and enrage active', () => {
        monster.addAbility(Ability.ENRAGE);
        monster.health = MONSTER_HEALTH - 1;
        expect(monster.getPostAbilitySpeed()).toBe(
          Math.ceil(Math.ceil(MONSTER_SPEED * LAST_STAND_MULTIPLIER) * ENRAGE_MULTIPLIER),
        );
      });

      it('returns correct speed with enrage ability and enrage inactive', () => {
        monster.addAbility(Ability.ENRAGE);
        expect(monster.getPostAbilitySpeed()).toBe(
          Math.ceil(MONSTER_SPEED * LAST_STAND_MULTIPLIER),
        );
      });

      it('returns correct speed with swiftness', () => {
        monster.addBuff(Ability.SWIFTNESS);
        const lastStandSpeed = Math.ceil(MONSTER_SPEED * LAST_STAND_MULTIPLIER);
        expect(monster.getPostAbilitySpeed()).toBe(lastStandSpeed + 1);
      });

      it('returns correct speed with slow', () => {
        monster.addDebuff(Ability.SLOW);
        const lastStandSpeed = Math.ceil(MONSTER_SPEED * LAST_STAND_MULTIPLIER);
        expect(monster.getPostAbilitySpeed()).toBe(lastStandSpeed - 1);
      });

      it('returns correct speed with all modifiers', () => {
        monster.addAbility(Ability.ENRAGE);
        monster.health = 4;
        monster.addBuff(Ability.SWIFTNESS);
        monster.addBuff(Ability.SWIFTNESS);
        monster.addDebuff(Ability.SLOW);
        monster.addSummonerSpeed(1);
        const expectedSpeed =
          Math.ceil((MONSTER_SPEED + 1) * LAST_STAND_MULTIPLIER * ENRAGE_MULTIPLIER) + 2 - 1;
        expect(monster.getPostAbilitySpeed()).toBe(expectedSpeed);
      });
    });

    describe('without last stand ability', () => {
      it('returns correct speed with no other modifiers', () => {
        expect(monster.getPostAbilitySpeed()).toBe(MONSTER_SPEED);
      });

      it('returns correct speed with summoner speed modifiers', () => {
        monster.addSummonerSpeed(2);
        expect(monster.getPostAbilitySpeed()).toBe(MONSTER_SPEED + 2);
      });

      it('returns correct speed with enrage ability and enrage active', () => {
        monster.addAbility(Ability.ENRAGE);
        monster.health = MONSTER_HEALTH - 1;
        expect(monster.getPostAbilitySpeed()).toBe(Math.ceil(MONSTER_SPEED * ENRAGE_MULTIPLIER));
      });

      it('returns correct speed with enrage ability and enrage inactive', () => {
        monster.addAbility(Ability.ENRAGE);
        expect(monster.getPostAbilitySpeed()).toBe(MONSTER_SPEED);
      });

      it('returns correct speed with swiftness', () => {
        monster.addBuff(Ability.SWIFTNESS);
        expect(monster.getPostAbilitySpeed()).toBe(MONSTER_SPEED + 1);
      });

      it('returns correct speed with slow', () => {
        monster.addDebuff(Ability.SLOW);
        expect(monster.getPostAbilitySpeed()).toBe(MONSTER_SPEED - 1);
      });

      it('returns correct speed with all modifiers', () => {
        monster.addBuff(Ability.SWIFTNESS);
        monster.addBuff(Ability.SWIFTNESS);
        monster.addDebuff(Ability.SLOW);
        monster.addSummonerSpeed(1);
        const expectedSpeed = MONSTER_SPEED + 1 + 2 - 1;
        expect(monster.getPostAbilitySpeed()).toBe(expectedSpeed);
      });

      it('returns minimum of 1', () => {
        monster.addSummonerSpeed(-10);
        expect(monster.getPostAbilitySpeed()).toBe(1);
      });
    });
  });

  describe('magic', () => {
    describe('getPostAbilityMagic function', () => {
      it("returns 0 if there's no magic", () => {
        monster.addSummonerMagic(1);
        monster.magic = 0;
        expect(monster.getPostAbilityAttackOfType(AttackType.MAGIC)).toBe(0);
      });

      it('returns correct magic with summoner magic', () => {
        monster.addSummonerMagic(1);
        expect(monster.getPostAbilityAttackOfType(AttackType.MAGIC)).toBe(MONSTER_MAGIC + 1);
      });

      it('returns correct magic with halving', () => {
        monster.addDebuff(Ability.HALVING);
        expect(monster.getPostAbilityAttackOfType(AttackType.MAGIC)).toBe(
          Math.floor(MONSTER_MAGIC / 2),
        );
      });

      it('returns correct magic with last stand', () => {
        monster.addAbility(Ability.LAST_STAND);
        expect(monster.getPostAbilityAttackOfType(AttackType.MAGIC)).toBe(MONSTER_MAGIC);
        monster.setIsOnlyMonster();
        expect(monster.getPostAbilityAttackOfType(AttackType.MAGIC)).toBe(
          Math.ceil(MONSTER_MAGIC * LAST_STAND_MULTIPLIER),
        );
      });

      it('returns correct magic with silence', () => {
        monster.addDebuff(Ability.SILENCE);
        monster.addDebuff(Ability.SILENCE);
        monster.addDebuff(Ability.SILENCE);
        expect(monster.getPostAbilityAttackOfType(AttackType.MAGIC)).toBe(MONSTER_MAGIC - 3);
      });

      it('returns correct magic with all modifiers', () => {
        monster.addAbility(Ability.LAST_STAND);
        monster.setIsOnlyMonster();
        monster.addDebuff(Ability.HALVING);
        monster.addDebuff(Ability.SILENCE);
        const SUMMONER_MAGIC = -1;
        monster.addSummonerMagic(SUMMONER_MAGIC);
        const expectedMagic =
          Math.ceil(Math.floor((MONSTER_MAGIC + SUMMONER_MAGIC) / 2) * LAST_STAND_MULTIPLIER) -
          /* silence */ 1;
        expect(monster.getPostAbilityAttackOfType(AttackType.MAGIC)).toBe(expectedMagic);
      });
    });
  });

  describe('ranged', () => {
    describe('getPostAbilityRanged function', () => {
      it("returns 0 if there's no ranged", () => {
        monster.ranged = 0;
        monster.addSummonerRanged(1);
        expect(monster.getPostAbilityAttackOfType(AttackType.RANGED)).toBe(0);
      });

      it('returns correct ranged with summoner range', () => {
        monster.addSummonerRanged(1);
        expect(monster.getPostAbilityAttackOfType(AttackType.RANGED)).toBe(MONSTER_RANGED + 1);
      });

      it('returns correct ranged with halving', () => {
        monster.addDebuff(Ability.HALVING);
        expect(monster.getPostAbilityAttackOfType(AttackType.RANGED)).toBe(
          Math.floor(MONSTER_RANGED / 2),
        );
      });

      it('returns correct ranged with last stand', () => {
        monster.addAbility(Ability.LAST_STAND);
        expect(monster.getPostAbilityAttackOfType(AttackType.RANGED)).toBe(MONSTER_RANGED);
        monster.setIsOnlyMonster();
        expect(monster.getPostAbilityAttackOfType(AttackType.RANGED)).toBe(
          Math.ceil(MONSTER_RANGED * LAST_STAND_MULTIPLIER),
        );
      });

      it('returns correct ranged with headwinds', () => {
        monster.addDebuff(Ability.HEADWINDS);
        monster.addDebuff(Ability.HEADWINDS);
        monster.addDebuff(Ability.HEADWINDS);
        expect(monster.getPostAbilityAttackOfType(AttackType.RANGED)).toBe(MONSTER_RANGED - 3);
      });

      it('returns correct ranged with all modifiers', () => {
        const SUMMONER_RANGED = 3;
        monster.addAbility(Ability.LAST_STAND);
        monster.setIsOnlyMonster();
        monster.addDebuff(Ability.HALVING);
        monster.addDebuff(Ability.HEADWINDS);
        monster.addSummonerRanged(SUMMONER_RANGED);
        const expectedRanged =
          Math.ceil(Math.floor((MONSTER_RANGED + SUMMONER_RANGED) / 2) * LAST_STAND_MULTIPLIER) -
          /* silence */ 1;
        expect(monster.getPostAbilityAttackOfType(AttackType.RANGED)).toBe(expectedRanged);
      });
    });
  });

  describe('melee', () => {
    describe('getPostAbilityMelee function', () => {
      it("returns 0 if there's no melee", () => {
        monster.melee = 0;
        monster.addSummonerMelee(1);
        expect(monster.getPostAbilityAttackOfType(AttackType.MELEE)).toBe(0);
      });

      it('returns correct melee with summoner melee', () => {
        monster.addSummonerMelee(1);
        expect(monster.getPostAbilityAttackOfType(AttackType.MELEE)).toBe(MONSTER_MELEE + 1);
      });

      it('returns correct melee with halving', () => {
        monster.addDebuff(Ability.HALVING);
        expect(monster.getPostAbilityAttackOfType(AttackType.MELEE)).toBe(
          Math.floor(MONSTER_MELEE / 2),
        );
      });

      it('returns correct melee with last stand', () => {
        monster.addAbility(Ability.LAST_STAND);
        expect(monster.getPostAbilityAttackOfType(AttackType.MELEE)).toBe(Math.ceil(MONSTER_MELEE));
        monster.setIsOnlyMonster();
        expect(monster.getPostAbilityAttackOfType(AttackType.MELEE)).toBe(
          Math.ceil(MONSTER_MELEE * LAST_STAND_MULTIPLIER),
        );
      });

      it('returns correct melee with demoralize', () => {
        monster.addDebuff(Ability.DEMORALIZE);
        monster.addDebuff(Ability.DEMORALIZE);
        expect(monster.getPostAbilityAttackOfType(AttackType.MELEE)).toBe(MONSTER_MELEE - 2);
      });

      it('returns correct melee with inspire', () => {
        monster.addBuff(Ability.INSPIRE);
        monster.addBuff(Ability.INSPIRE);
        expect(monster.getPostAbilityAttackOfType(AttackType.MELEE)).toBe(MONSTER_MELEE + 2);
      });

      it('returns correct melee with enrage', () => {
        monster.addAbility(Ability.ENRAGE);
        expect(monster.getPostAbilityAttackOfType(AttackType.MELEE)).toBe(MONSTER_MELEE);
        monster.health = MONSTER_HEALTH - 1;
        expect(monster.getPostAbilityAttackOfType(AttackType.MELEE)).toBe(
          Math.ceil(MONSTER_MELEE * ENRAGE_MULTIPLIER),
        );
      });

      it('returns correct melee with all modifiers', () => {
        monster.addAbility(Ability.ENRAGE);
        monster.addAbility(Ability.LAST_STAND);
        monster.setIsOnlyMonster();
        monster.addDebuff(Ability.HALVING);
        monster.addDebuff(Ability.DEMORALIZE);
        monster.addBuff(Ability.INSPIRE);
        monster.addBuff(Ability.INSPIRE);
        const SUMMONER_MELEE = -1;
        monster.addSummonerMelee(SUMMONER_MELEE);
        monster.health = MONSTER_HEALTH - 1;
        const expectedMelee = Math.ceil(
          (Math.ceil(Math.floor((MONSTER_MELEE + SUMMONER_MELEE) / 2) * LAST_STAND_MULTIPLIER) -
            /* demoralize */ 1 +
            /* inspire */ 2) *
            ENRAGE_MULTIPLIER,
        );
        expect(monster.getPostAbilityAttackOfType(AttackType.MELEE)).toBe(expectedMelee);
      });
    });
  });
});
