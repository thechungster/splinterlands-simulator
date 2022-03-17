import { GameMonster } from './game_monster';
import { GameSummoner } from './game_summoner';
import { Ability } from './types';

export class GameTeam {
  private readonly summoner: GameSummoner;
  private readonly monsterList: GameMonster[];

  constructor(summoner: GameSummoner, monsterList: GameMonster[]) {
    this.summoner = summoner;
    this.monsterList = monsterList;
    if (this.monsterList.length === 1) {
      monsterList[0].setIsOnlyMonster();
    }
    this.setMonsterPositions();
  }

  private setMonsterPositions() {
    for (let i = 0; i < this.monsterList.length; i++) {
      this.monsterList[i].setCardPosition(i);
    }
  }

  public monstersOnPostRound() {
    this.monsterList.forEach((monster) => monster.onPostRound());
  }

  /** Position of the alive monsters */
  public getMonsterPosition(monster: GameMonster): number {
    return this.getAliveMonsters().findIndex((m) => m === monster);
  }

  public getSummoner() {
    return this.summoner;
  }

  public getMonstersList() {
    return this.monsterList;
  }

  public getAliveMonsters() {
    return this.monsterList.filter((monster) => monster.isAlive());
  }

  public getFirstAliveMonster() {
    return this.getAliveMonsters()[0];
  }

  public getUnmovedMonsters() {
    return this.getAliveMonsters().filter(
      (monster) => !monster.getHasTurnPassed()
    );
  }

  public maybeSetLastStand() {
    const aliveMonsters = this.getAliveMonsters();
    if (aliveMonsters.length === 1) {
      aliveMonsters[0].setIsOnlyMonster();
    }
  }

  public setAllMonsterHealth() {
    for (const monster of this.monsterList) {
      monster.health = monster.getPostAbilityMaxHealth();
    }
  }

  getScattershotTarget(): GameMonster {
    const aliveMonsters = this.getAliveMonsters();
    const randomMonsterNum = Math.floor(Math.random() * aliveMonsters.length);
    return aliveMonsters[randomMonsterNum];
  }

  public getSnipeTarget(): GameMonster {
    const tauntMonster = this.getTauntMonster();
    if (tauntMonster !== null) {
      return tauntMonster;
    }
    const backLineMonsters = this.getBacklineAliveMonsters();
    return (
      backLineMonsters.find(
        (m) =>
          !m.hasAbility(Ability.CAMOUFLAGE) &&
          (!m.hasAttack() || m.ranged > 0 || m.magic > 0)
      ) || this.getFirstAliveMonster()
    );
  }

  public getOpportunityTarget(): GameMonster | null {
    const tauntMonster = this.getTauntMonster();
    if (tauntMonster !== null) {
      return tauntMonster;
    }
    const aliveMonsters = this.getAliveMonsters();
    let opportunityTarget = aliveMonsters[0];
    let lowestHealth = opportunityTarget.health;
    for (let i = 1; i < aliveMonsters.length; i++) {
      const monster = aliveMonsters[i];
      if (monster.hasAbility(Ability.CAMOUFLAGE)) {
        continue;
      }
      if (monster.health < lowestHealth) {
        opportunityTarget = monster;
        lowestHealth = monster.health;
      }
    }
    return opportunityTarget;
  }

  public getSneakTarget(): GameMonster {
    const tauntMonster = this.getTauntMonster();
    if (tauntMonster !== null) {
      return tauntMonster;
    }
    const aliveMonsters = this.getAliveMonsters();
    for (let i = aliveMonsters.length - 1; i > 0; i--) {
      const monster = aliveMonsters[i];
      if (!monster.hasAbility(Ability.CAMOUFLAGE)) {
        return monster;
      }
    }
    return aliveMonsters[0];
  }

  public getBacklineAliveMonsters(): GameMonster[] {
    const aliveMonsters = this.getAliveMonsters();
    if (aliveMonsters.length <= 1) {
      return [];
    }
    return aliveMonsters.slice(1);
  }

  /** Which monster to repair, returns NULL if none. Repair target is the one that lost the most armor. */
  public getRepairTarget(): GameMonster | null {
    let largestArmorDiff = 0;
    let monsterToRepair = null;
    for (let currentMonster of this.getAliveMonsters()) {
      const armorDiff =
        currentMonster.getPostAbilityMaxArmor() - currentMonster.armor;
      if (armorDiff > largestArmorDiff) {
        largestArmorDiff = armorDiff;
        monsterToRepair = currentMonster;
      }
    }
    return monsterToRepair;
  }

  /** Which backline monster to triage, returns NULL if none */
  public getTriageHealTarget(): GameMonster | null {
    let largestHealthDiff = 0;
    let monsterToTriage = null;
    const aliveMonsters = this.getAliveMonsters();

    for (let i = 1; i < aliveMonsters.length; i++) {
      const currMonster = aliveMonsters[i];
      const healthDiff =
        currMonster.getPostAbilityMaxHealth() - currMonster.health;
      if (healthDiff > largestHealthDiff) {
        largestHealthDiff = healthDiff;
        monsterToTriage = currMonster;
      }
    }
    return monsterToTriage;
  }

  public getTauntMonster(): GameMonster | null {
    return (
      this.getAliveMonsters().find((m) => m.hasAbility(Ability.TAUNT)) || null
    );
  }
}
