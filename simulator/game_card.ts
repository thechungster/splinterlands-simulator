import { CardDetail, CardStats } from './types';
import { Ability } from './types';

export abstract class GameCard {
  private readonly cardDetail: CardDetail;
  private readonly cardLevel: number;
  private readonly team: number;

  abilities: Set<Ability> = new Set();
  speed = 0;
  startingArmor = 0;
  armor = 0;
  startingHealth = 0;
  health = 0;
  magic = 0;
  melee = 0;
  ranged = 0;
  mana = 0;

  constructor(cardDetail: CardDetail, cardLevel: number, team: number) {
    this.cardDetail = cardDetail;
    this.cardLevel = cardLevel - 1;
    this.team = team;

    this.setStats(cardDetail.stats);
  }

  /** To be overwritten */
  onSelfDeath(): void {}

  public getCardDetail(): CardDetail {
    return this.cardDetail;
  }

  public hasAbility(ability: Ability) {
    return this.abilities.has(ability);
  }

  public removeAbility(ability: Ability) {
    this.abilities.delete(ability);
  }

  public getTeamNumber() {
    return this.team;
  }

  getRarity(): number {
    return this.cardDetail.rarity;
  }

  public getName(): string {
    return this.cardDetail.name;
  }

  private setStats(stats: CardStats) {
    this.speed = this.getStat(stats.speed);
    this.armor = this.getStat(stats.armor);
    this.startingArmor = this.armor;
    this.health = this.getStat(stats.health);
    this.startingHealth = this.health;
    this.magic = this.getStat(stats.magic);
    this.ranged = this.getStat(stats.ranged);
    this.melee = this.getStat(stats.attack);
    this.mana = this.getStat(stats.mana);
    this.addAbilities(stats.abilities);
  }

  private getStat(stat: number[] | number): number {
    return Array.isArray(stat) ? stat[this.cardLevel] : stat;
  }

  private addAbilities(abilities: Ability[] | Ability[][] | undefined) {
    if (abilities === undefined) {
      return;
    }
    // For monster
    if (Array.isArray(abilities[0])) {
      const relevantAbilities = (abilities as Ability[][])
        .slice(0, this.cardLevel + 1)
        .flat();
      relevantAbilities.forEach((ability) => {
        this.abilities.add(ability);
      });
    } else {
      // For Summoner
      this.addAllAbilitiesArray(abilities as Ability[]);
    }
  }

  private addAllAbilitiesArray(abilities: Ability[]) {
    abilities.forEach((ability) => {
      this.abilities.add(ability);
    });
  }
}
