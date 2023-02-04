import { GameMonster } from '../game_monster';
import { GameSummoner } from '../game_summoner';
import { GameTeam } from '../game_team';
import { Ability, Ruleset } from '../types';
import { doRulesetPreGameBuff } from './ruleset_utils';
import { DEFAULT_MONSTER_STAT, getDefaultFakeMonster, getDefaultFakeSummoner } from './test_utils';

describe('ruleset_util', () => {
  let teamOne: GameTeam;
  let teamTwo: GameTeam;
  let allMonsters: GameMonster[];

  beforeEach(() => {
    const summonerOne = getDefaultFakeSummoner();
    const summonerTwo = getDefaultFakeSummoner();
    const monstersOne = [getDefaultFakeMonster(), getDefaultFakeMonster(), getDefaultFakeMonster()];
    const monstersTwo = [getDefaultFakeMonster(), getDefaultFakeMonster(), getDefaultFakeMonster()];
    allMonsters = monstersOne.concat(monstersTwo);
    teamOne = new GameTeam(summonerOne, monstersOne);
    teamTwo = new GameTeam(summonerTwo, monstersTwo);
  });

  it('applies 2 armor in armored up ruleset', () => {
    doRulesetPreGameBuff(getRuleset(Ruleset.ARMORED_UP), teamOne, teamTwo);
    for (const monster of allMonsters) {
      expect(monster.armor).toBe(DEFAULT_MONSTER_STAT + 2);
    }
  });

  it('removes all abilities in back to basics ruleset', () => {
    allMonsters[1].addAbility(Ability.BLAST);
    allMonsters[3].addAbility(Ability.AFFLICTION);
    allMonsters[4].addAbility(Ability.BLIND);
    doRulesetPreGameBuff(getRuleset(Ruleset.BACK_TO_BASICS), teamOne, teamTwo);
    for (const monster of allMonsters) {
      expect(monster.abilities.size).toBe(0);
    }
  });

  it('gives close range ability to all monsters in close range ruleset', () => {
    doRulesetPreGameBuff(getRuleset(Ruleset.CLOSE_RANGE), teamOne, teamTwo);
    for (const monster of allMonsters) {
      expect(monster.hasAbility(Ability.CLOSE_RANGE)).toBe(true);
    }
  });

  it('gives opportunity ability to all monsters in equal opportunity ruleset', () => {
    doRulesetPreGameBuff(getRuleset(Ruleset.EQUAL_OPPORTUNITY), teamOne, teamTwo);
    for (const monster of allMonsters) {
      expect(monster.hasAbility(Ability.OPPORTUNITY)).toBe(true);
    }
  });

  it('sets health of all monsters to highest health monster in equalizer ruleset', () => {
    allMonsters[0].health = 20;
    doRulesetPreGameBuff(getRuleset(Ruleset.EQUALIZER), teamOne, teamTwo);
    for (const monster of allMonsters) {
      expect(monster.health).toBe(20);
    }
  });

  it('gives blast ability to all monsters in explosive weaponry ruleset', () => {
    doRulesetPreGameBuff(getRuleset(Ruleset.EXPLOSIVE_WEAPONRY), teamOne, teamTwo);
    for (const monster of allMonsters) {
      expect(monster.hasAbility(Ability.BLAST)).toBe(true);
    }
  });

  it('removes sneak/snipe ability of all monsters in fog of war ruleset', () => {
    allMonsters[0].addAbility(Ability.SNEAK);
    allMonsters[1].addAbility(Ability.SNIPE);
    allMonsters[5].addAbility(Ability.SNIPE);
    doRulesetPreGameBuff(getRuleset(Ruleset.FOG_OF_WAR), teamOne, teamTwo);
    for (const monster of allMonsters) {
      expect(monster.hasAbility(Ability.SNEAK)).toBe(false);
      expect(monster.hasAbility(Ability.SNIPE)).toBe(false);
    }
  });

  it('removes healing abilities of all monsters in healed out ruleset', () => {
    allMonsters[0].addAbility(Ability.HEAL);
    allMonsters[1].addAbility(Ability.TANK_HEAL);
    allMonsters[5].addAbility(Ability.TRIAGE);
    doRulesetPreGameBuff(getRuleset(Ruleset.HEALED_OUT), teamOne, teamTwo);
    for (const monster of allMonsters) {
      expect(monster.hasAbility(Ability.HEAL)).toBe(false);
      expect(monster.hasAbility(Ability.TANK_HEAL)).toBe(false);
      expect(monster.hasAbility(Ability.TRIAGE)).toBe(false);
    }
  });

  it('gives knock out ability to all monsters in heavy hitters ruleset', () => {
    doRulesetPreGameBuff(getRuleset(Ruleset.HEAVY_HITTERS), teamOne, teamTwo);
    for (const monster of allMonsters) {
      expect(monster.hasAbility(Ability.KNOCK_OUT)).toBe(true);
    }
  });

  it('gives divine shield ability to all monsters in holy protection ruleset', () => {
    doRulesetPreGameBuff(getRuleset(Ruleset.HOLY_PROTECTION), teamOne, teamTwo);
    for (const monster of allMonsters) {
      expect(monster.hasAbility(Ability.DIVINE_SHIELD)).toBe(true);
    }
  });

  it('gives custom melee mayhem ability to all monsters in melee mayhem ruleset', () => {
    doRulesetPreGameBuff(getRuleset(Ruleset.MELEE_MAYHEM), teamOne, teamTwo);
    for (const monster of allMonsters) {
      expect(monster.hasAbility(Ability.MELEE_MAYHEM)).toBe(true);
    }
  });

  it('debuffs all monsters with poison in noxious fumes ruleset', () => {
    allMonsters[0].addAbility(Ability.IMMUNITY);
    allMonsters[5].addAbility(Ability.IMMUNITY);
    doRulesetPreGameBuff(getRuleset(Ruleset.NOXIOUS_FUMES), teamOne, teamTwo);
    for (const monster of allMonsters) {
      expect(monster.hasDebuff(Ability.POISON)).toBe(!monster.hasAbility(Ability.IMMUNITY));
    }
  });

  it('gives summoner no stats in silenced summoner ruleset', () => {
    const summoners = [teamOne.getSummoner(), teamTwo.getSummoner()];
    for (const summoner of summoners) {
      summoner.abilities.add(Ability.BLAST);
      summoner.health = 2;
      summoner.armor = 2;
      summoner.speed = 1;
      summoner.melee = 4;
      summoner.ranged = 2;
      summoner.magic = 3;
    }
    doRulesetPreGameBuff(getRuleset(Ruleset.SILENCED_SUMMONERS), teamOne, teamTwo);
    for (const summoner of summoners) {
      expect(summoner.abilities.size).toBe(0);
      expect(summoner.health).toBe(0);
      expect(summoner.armor).toBe(0);
      expect(summoner.speed).toBe(0);
      expect(summoner.melee).toBe(0);
      expect(summoner.ranged).toBe(0);
      expect(summoner.magic).toBe(0);
    }
  });

  it('gives enrage ability to all monsters in spreading fury ruleset', () => {
    doRulesetPreGameBuff(getRuleset(Ruleset.WHAT_DOESNT_KILL_YOU), teamOne, teamTwo);
    for (const monster of allMonsters) {
      expect(monster.hasAbility(Ability.ENRAGE)).toBe(true);
    }
  });

  it('gives sneak ability to all melee monsters in super sneak ruleset', () => {
    allMonsters[1].melee = 0;
    allMonsters[3].melee = 0;
    doRulesetPreGameBuff(getRuleset(Ruleset.SUPER_SNEAK), teamOne, teamTwo);
    for (const monster of allMonsters) {
      expect(monster.hasAbility(Ability.SNEAK)).toBe(monster.melee > 0);
    }
  });

  it('gives void armor ability to all monsters in weak magic ruleset', () => {
    doRulesetPreGameBuff(getRuleset(Ruleset.WEAK_MAGIC), teamOne, teamTwo);
    for (const monster of allMonsters) {
      expect(monster.hasAbility(Ability.VOID_ARMOR)).toBe(true);
    }
  });

  it('gives snipe ability to all monsters that have ranged/magic in target practice ruleset', () => {
    allMonsters[0].magic = 0;
    allMonsters[0].ranged = 0;
    allMonsters[4].magic = 0;
    allMonsters[4].ranged = 0;
    doRulesetPreGameBuff(getRuleset(Ruleset.TARGET_PRACTICE), teamOne, teamTwo);
    for (const monster of allMonsters) {
      expect(monster.hasAbility(Ability.SNIPE)).toBe(monster.magic > 0 && monster.ranged > 0);
    }
  });
});

function getRuleset(rule: Ruleset) {
  return new Set<Ruleset>([rule]);
}
