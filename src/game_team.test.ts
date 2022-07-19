import { GameMonster } from './game_monster';
import { GameSummoner } from './game_summoner';
import { GameTeam } from './game_team';
import { Ability, TeamNumber } from './types';
import {
  getDefaultFakeMagicOnlyCardDetail,
  getDefaultFakeMeleeOnlyCardDetail,
  getDefaultFakeRangedOnlyCardDetail,
} from './utils/test_utils';

describe('GameTeam', () => {
  let fakeSummoner: GameSummoner;
  let fakeCards: GameMonster[];
  let gameTeam: GameTeam;

  beforeEach(() => {
    fakeSummoner = new GameSummoner(getDefaultFakeMagicOnlyCardDetail(), 1);
    fakeCards = [];
    fakeCards.push(new GameMonster(getDefaultFakeMeleeOnlyCardDetail(), 1));
    fakeCards.push(new GameMonster(getDefaultFakeMagicOnlyCardDetail(), 1));
    fakeCards.push(new GameMonster(getDefaultFakeRangedOnlyCardDetail(), 1));
    gameTeam = new GameTeam(fakeSummoner, fakeCards);
  });

  it('sets team number properly', () => {
    gameTeam.setTeam(TeamNumber.TWO);
    expect(fakeSummoner.getTeamNumber()).toBe(TeamNumber.TWO);
    for (const card of fakeCards) {
      expect(card.getTeamNumber()).toBe(TeamNumber.TWO);
    }
  });

  it('getMonsterPosition returns correct position of alive monster', () => {
    expect(gameTeam.getMonsterPosition(fakeCards[1])).toBe(1);
    fakeCards[0].health = 0;
    expect(gameTeam.getMonsterPosition(fakeCards[1])).toBe(0);
  });

  it('getSummoner returns summoner card', () => {
    expect(gameTeam.getSummoner()).toBe(fakeSummoner);
  });

  it('getMonstersList returns all monsters', () => {
    expect(gameTeam.getMonstersList()).toEqual(fakeCards);
  });

  it('getAliveMonsters returns only alive monsters', () => {
    expect(gameTeam.getAliveMonsters()).toEqual(fakeCards);
    fakeCards[2].health = 0;
    fakeCards.pop();
    expect(gameTeam.getAliveMonsters()).toEqual(fakeCards);
  });

  it('getFirstAliveMonster returns the first alive monster', () => {
    expect(gameTeam.getFirstAliveMonster()).toBe(fakeCards[0]);
    fakeCards[0].health = 0;
    fakeCards[1].health = 0;
    expect(gameTeam.getFirstAliveMonster()).toBe(fakeCards[2]);
  });

  it('getUnmovedMonsters returns the unmoved monsters', () => {
    expect(gameTeam.getUnmovedMonsters()).toEqual(fakeCards);
    fakeCards[0].setHasTurnPassed(true);
    fakeCards.shift();
    expect(gameTeam.getUnmovedMonsters()).toEqual(fakeCards);
  });

  it('maybeSetLastStand sets only monster if there is only one alive monster', () => {
    fakeCards[2].health = 0;
    gameTeam.maybeSetLastStand();
    for (const card of fakeCards) {
      expect(card.isLastMonster()).toBe(false);
    }
    fakeCards[1].health = 0;
    gameTeam.maybeSetLastStand();
    for (let i = 0; i < fakeCards.length; i++) {
      expect(fakeCards[i].isLastMonster()).toBe(i === 0);
    }
  });

  it('setAllMonsterHealth sets monsters health to maximum', () => {
    const health = fakeCards[0].health;
    fakeCards[0].addBuff(Ability.STRENGTHEN);
    fakeCards[0].health = 0;
    gameTeam.setAllMonsterHealth();
    expect(fakeCards[0].health).toBe(health + 1);
  });

  it('getScatterShotTarget returns random target', () => {
    const mathRandomSpy = jest.spyOn<Math, any>(Math, 'random');
    mathRandomSpy.mockReturnValue(0.8);
    expect(gameTeam.getScattershotTarget()).toBe(fakeCards[2]);
    mathRandomSpy.mockReturnValue(0.01);
    expect(gameTeam.getScattershotTarget()).toBe(fakeCards[0]);
    fakeCards[2].health = 0;
    fakeCards[1].health = 0;
    mathRandomSpy.mockReturnValue(0.8);
    expect(gameTeam.getScattershotTarget()).toBe(fakeCards[0]);
  });

  describe('resetTeam', () => {
    it('resets the card stats', () => {
      fakeCards[0].health = 0;
      fakeCards[1].armor = 0;
      fakeCards[2].addAbility(Ability.LAST_STAND);
      fakeCards[2].setIsOnlyMonster();
      gameTeam.setTeam(TeamNumber.ONE);
      gameTeam.resetTeam();
      expect(gameTeam.getAliveMonsters().length).toBe(3);
      expect(gameTeam.getAliveMonsters()[0].health).toBe(5);
      expect(gameTeam.getAliveMonsters()[1].armor).toBe(5);
      expect(gameTeam.getAliveMonsters()[2].hasAbility(Ability.LAST_STAND)).toBe(false);
    });

    it("set only monster if there's only one monster", () => {
      const fakeMonster = new GameMonster(getDefaultFakeMagicOnlyCardDetail(), 1);
      gameTeam = new GameTeam(fakeSummoner, [fakeMonster]);
      gameTeam.setTeam(TeamNumber.ONE);
      expect(fakeMonster.isLastMonster()).toBe(false);
      gameTeam.resetTeam();
      expect(gameTeam.getMonstersList()[0].isLastMonster()).toBe(true);
    });
  });

  describe('getSnipeTarget function', () => {
    it('always returns taunt monster if there is one', () => {
      fakeCards[0].addAbility(Ability.TAUNT);
      expect(gameTeam.getSnipeTarget()).toBe(fakeCards[0]);

      fakeCards[0].removeAbility(Ability.TAUNT);
      fakeCards[2].addAbility(Ability.TAUNT);
      expect(gameTeam.getSnipeTarget()).toBe(fakeCards[2]);
    });

    it('returns the correct target', () => {
      expect(gameTeam.getSnipeTarget()).toBe(fakeCards[1]);
    });

    it('returns the correct target if original target has camoflauge', () => {
      fakeCards[1].addAbility(Ability.CAMOUFLAGE);
      expect(gameTeam.getSnipeTarget()).toBe(fakeCards[2]);
    });

    it('returns first monster if no snipe targets', () => {
      fakeCards[1].addAbility(Ability.CAMOUFLAGE);
      fakeCards[2].addAbility(Ability.CAMOUFLAGE);
      expect(gameTeam.getSnipeTarget()).toBe(fakeCards[0]);
    });
  });

  describe('getOpportunityTarget function', () => {
    it('always returns taunt monster if there is one', () => {
      fakeCards[0].addAbility(Ability.TAUNT);
      expect(gameTeam.getOpportunityTarget()).toBe(fakeCards[0]);

      fakeCards[0].removeAbility(Ability.TAUNT);
      fakeCards[2].addAbility(Ability.TAUNT);
      expect(gameTeam.getOpportunityTarget()).toBe(fakeCards[2]);
    });

    it('returns the correct target', () => {
      fakeCards[1].health = 1;
      expect(gameTeam.getOpportunityTarget()).toBe(fakeCards[1]);
    });

    it('returns the correct target if original target has camoflauge', () => {
      fakeCards[1].health = 1;
      fakeCards[2].health = 2;
      fakeCards[1].addAbility(Ability.CAMOUFLAGE);
      expect(gameTeam.getOpportunityTarget()).toBe(fakeCards[2]);
    });

    it('returns first monster if no opportunity targets', () => {
      fakeCards[1].addAbility(Ability.CAMOUFLAGE);
      fakeCards[2].addAbility(Ability.CAMOUFLAGE);
      expect(gameTeam.getOpportunityTarget()).toBe(fakeCards[0]);
    });
  });

  describe('getSneakTarget function', () => {
    it('always returns taunt monster if there is one', () => {
      fakeCards[0].addAbility(Ability.TAUNT);
      expect(gameTeam.getSneakTarget()).toBe(fakeCards[0]);

      fakeCards[0].removeAbility(Ability.TAUNT);
      fakeCards[1].addAbility(Ability.TAUNT);
      expect(gameTeam.getSneakTarget()).toBe(fakeCards[1]);
    });

    it('returns the correct target', () => {
      expect(gameTeam.getSneakTarget()).toBe(fakeCards[2]);
    });

    it('returns the correct target if original target has camoflauge', () => {
      fakeCards[2].addAbility(Ability.CAMOUFLAGE);
      expect(gameTeam.getSneakTarget()).toBe(fakeCards[1]);
    });

    it('returns first monster if no sneak targets', () => {
      fakeCards[1].addAbility(Ability.CAMOUFLAGE);
      fakeCards[2].addAbility(Ability.CAMOUFLAGE);
      expect(gameTeam.getSneakTarget()).toBe(fakeCards[0]);
    });
  });

  describe('getRepairTarget function', () => {
    it('returns null if no armor is lost', () => {
      expect(gameTeam.getRepairTarget()).toBeNull();
    });

    it('returns the monster that lost the most armor', () => {
      fakeCards[1].armor = 3;
      expect(gameTeam.getRepairTarget()).toBe(fakeCards[1]);
      fakeCards[0].armor = 0;
      expect(gameTeam.getRepairTarget()).toBe(fakeCards[0]);
    });
  });

  describe('getTriageHealTarget function', () => {
    it('returns null if no armor is lost', () => {
      expect(gameTeam.getTriageHealTarget()).toBeNull();
    });

    it('returns the backline monster that lost the most health', () => {
      fakeCards[1].health = 3;
      expect(gameTeam.getTriageHealTarget()).toBe(fakeCards[1]);
      fakeCards[0].health = 1;
      expect(gameTeam.getTriageHealTarget()).toBe(fakeCards[1]);
      fakeCards[2].health = 1;
      expect(gameTeam.getTriageHealTarget()).toBe(fakeCards[2]);
    });
  });
});
