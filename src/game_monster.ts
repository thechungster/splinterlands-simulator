import { CardDetail } from 'splinterlands-types';
import { GameCard } from './game_card';
import { GameTeam } from './game_team';
import { Ability, AttackType } from './types';
import * as abilityUtils from './utils/ability_utils';

export class GameMonster extends GameCard {
  // Should be set when put in a team.
  private cardPosition = 0;

  private isOnlyMonster = false;
  private hasTurnPassed = false;
  private summonerSpeed = 0;
  private summonerArmor = 0;
  private summonerMelee = 0;
  private summonerRanged = 0;
  private summonerMagic = 0;
  private hadDivineShield = false;

  constructor(cardDetail: CardDetail | number, cardLevel: number) {
    super(cardDetail, cardLevel);
  }

  setCardPosition(pos: number) {
    this.cardPosition = pos;
  }

  // This is health
  addHealth(amt: number) {
    if (!this.isAlive()) {
      return;
    }
    let finalHealth = Math.min(this.health + amt, this.getPostAbilityMaxHealth());
    finalHealth = Math.max(finalHealth, 0);
    this.setHealth(finalHealth);
  }

  setHealth(health: number) {
    this.health = health;
  }

  /** Returns remaining damage after hitting health */
  hitHealth(damage: number) {
    const preHitHealth = this.health;
    this.addHealth(-1 * damage);
    if (this.health < 0) {
      return this.health * -1;
    }
    if (this.health === 0) {
      return damage - preHitHealth;
    }
    return 0;
  }

  /** Initial card position */
  getCardPosition() {
    return this.cardPosition;
  }

  isAlive() {
    return this.health > 0;
  }

  setHasTurnPassed(hasPassed: boolean) {
    this.hasTurnPassed = hasPassed;
  }

  getHasTurnPassed() {
    return this.hasTurnPassed;
  }

  getIsLastStand() {
    return this.isOnlyMonster && this.hasAbility(Ability.LAST_STAND);
  }

  isLastMonster() {
    return this.isOnlyMonster;
  }

  setIsOnlyMonster() {
    if (this.hasAbility(Ability.LAST_STAND)) {
      const prevMaxHealth = this.getPostAbilityMaxHealth();
      const dmgTaken = prevMaxHealth - this.health;
      this.isOnlyMonster = true;
      this.setHealth(this.getPostAbilityMaxHealth() - dmgTaken);
    }
    this.isOnlyMonster = true;
  }

  removeAllAbilities() {
    this.abilities.clear();
  }

  addAbility(ability: Ability) {
    this.abilities.add(ability);
  }

  hasAction() {
    if (this.isPureMelee() && this.canMeleeAttack()) {
      return true;
    }
    if (this.magic > 0) {
      return true;
    }
    for (const actionAbility of abilityUtils.ACTION_ABILITIES) {
      if (this.hasAbility(actionAbility)) {
        return true;
      }
    }
    if (this.ranged > 0 && this.cardPosition > 0) {
      return true;
    }
    return false;
  }

  isPureMelee() {
    return this.melee > 0 && this.ranged === 0 && this.magic === 0;
  }

  canMeleeAttack() {
    if (
      this.hasAbility(Ability.OPPORTUNITY) ||
      this.hasAbility(Ability.SNEAK) ||
      this.cardPosition === 0 ||
      this.hasAbility(Ability.MELEE_MAYHEM) ||
      (this.hasAbility(Ability.REACH) && this.cardPosition === 1)
    ) {
      return true;
    }
    return false;
  }

  /* Buffs and debuffs */
  addDebuff(debuff: Ability) {
    if (!this.isAlive()) {
      return;
    }
    if (
      this.abilities.has(Ability.IMMUNITY) &&
      (abilityUtils.UNCLEANSABLE_DEBUFFS.indexOf(debuff) < 0 || debuff === Ability.CRIPPLE)
    ) {
      return;
    }
    if (debuff === Ability.SNARE && this.hasDebuff(Ability.SNARE)) {
      return;
    }
    if (debuff === Ability.WEAKEN) {
      abilityUtils.weakenMonster(this);
    } else if (debuff === Ability.RUST) {
      abilityUtils.rustMonster(this);
    }
    const debuffAmount = (this.debuffsMap.get(debuff) || 0) + 1;
    this.debuffsMap.set(debuff, debuffAmount);
  }

  hasDebuff(debuff: Ability) {
    return this.debuffsMap.has(debuff);
  }

  removeDebuff(debuff: Ability) {
    const debuffAmt = this.getDebuffAmt(debuff) - 1;
    if (debuffAmt === 0) {
      this.debuffsMap.delete(debuff);
    } else {
      this.debuffsMap.set(debuff, debuffAmt);
    }
    if (debuff === Ability.WEAKEN) {
      this.addHealth(1);
    } else if (debuff === Ability.CRIPPLE) {
      // Not entirely sure if this is true.
      this.addHealth(1);
    } else if (debuff === Ability.RUST) {
      const currentArmor = this.armor;
      const maxArmor = this.getPostAbilityMaxArmor();
      this.armor = Math.min(currentArmor + 2, maxArmor);
    }
  }

  removeAllDebuff(debuff: Ability) {
    const debuffAmt = this.getDebuffAmt(debuff);
    for (let i = 0; i < debuffAmt; i++) {
      this.removeDebuff(debuff);
    }
  }

  cleanseDebuffs() {
    this.debuffsMap.forEach((value, key) => {
      if (abilityUtils.UNCLEANSABLE_DEBUFFS.indexOf(key) === -1) {
        this.removeAllDebuff(key);
      }
    });
  }

  getDebuffAmt(debuff: Ability) {
    return this.debuffsMap.get(debuff) || 0;
  }

  getBuffAmt(buff: Ability) {
    return this.buffsMap.get(buff) || 0;
  }

  addBuff(buff: Ability) {
    if (!this.isAlive()) {
      return;
    }
    const buffsAmount = (this.buffsMap.get(buff) || 0) + 1;
    this.buffsMap.set(buff, buffsAmount);

    if (buff === Ability.SCAVENGER) {
      abilityUtils.scavengeMonster(this);
    } else if (buff === Ability.LIFE_LEECH) {
      abilityUtils.lifeLeechMonster(this);
    } else if (buff === Ability.STRENGTHEN) {
      abilityUtils.strengthenMonster(this);
    } else if (buff === Ability.PROTECT) {
      abilityUtils.protectMonster(this);
    }
  }

  hasBuff(buff: Ability) {
    return this.buffsMap.has(buff);
  }

  getAllBuffs() {
    return this.buffsMap;
  }

  removeBuff(buff: Ability) {
    if (!this.hasBuff(buff)) {
      return;
    }
    const newBuffAmt = this.getBuffAmt(buff) - 1;
    if (newBuffAmt === 0) {
      this.buffsMap.delete(buff);
    } else {
      this.buffsMap.set(buff, newBuffAmt);
    }

    if (buff === Ability.SCAVENGER) {
      this.removeBuffHealth(1);
    } else if (buff === Ability.LIFE_LEECH) {
      this.removeBuffHealth(1);
    } else if (buff === Ability.STRENGTHEN) {
      this.removeStrengthenHealth(1);
    } else if (buff === Ability.PROTECT) {
      this.armor = Math.min(this.getPostAbilityMaxArmor(), this.armor);
    }
  }

  // TODO: Maybe this is true for everything?? idk.
  removeStrengthenHealth(healthAmt: number) {
    if (this.health > this.getPostAbilityMaxHealth()) {
      this.removeBuffHealth(healthAmt);
    }
  }

  removeBuffHealth(healthAmt: number) {
    if (this.health < 1) {
      return;
    }
    this.health = Math.max(this.health - healthAmt, 1);
  }

  removeAllBuff(buff: Ability) {
    const buffAmt = this.getBuffAmt(buff);
    for (let i = 0; i < buffAmt; i++) {
      this.removeBuff(buff);
    }
  }

  removeDivineShield() {
    this.hadDivineShield = true;
    this.removeAbility(Ability.DIVINE_SHIELD);
  }

  addSummonerArmor(stat: number) {
    this.summonerArmor += stat;
    this.armor = Math.max(this.armor + stat, 0);
  }

  addSummonerHealth(stat: number) {
    this.startingHealth = this.startingHealth + stat;
    this.health = Math.max(this.health + stat, 1);
  }

  addSummonerSpeed(stat: number) {
    this.summonerSpeed += stat;
  }

  addSummonerMelee(stat: number) {
    this.summonerMelee += stat;
  }

  addSummonerRanged(stat: number) {
    this.summonerRanged += stat;
  }

  addSummonerMagic(stat: number) {
    this.summonerMagic += stat;
  }

  getSummonerArmor() {
    return this.summonerArmor;
  }

  hasAttack() {
    if (
      this.melee > 0 ||
      this.ranged > 0 ||
      this.magic > 0 ||
      this.getWeaponsTrainingDamage() > 0
    ) {
      return true;
    }
  }

  /** If this monster has no attack, it will get the weapons training from an adjacent monster and return the attack */
  getWeaponsTrainingDamage() {
    if (this.melee > 0 || this.ranged > 0 || this.magic > 0) {
      return 0;
    }
    return 0;
    // const monsterPos = this.gameTeam?.getMonsterPosition(this);
    // const aliveMonsters = this.gameTeam?.getAliveMonsters();
    // if (!monsterPos && !aliveMonsters) {
    //   return 0;
    // }
    // let weaponsTrainingDamage = 0;
    // const beforeMonster = aliveMonsters[monsterPos - 1];
    // const afterMonster = aliveMonsters[monsterPos + 1];
    // if (beforeMonster && beforeMonster.hasAbility(Ability.WEAPONS_TRAINING)) {
    //   weaponsTrainingDamage = beforeMonster.getPostAbilityMelee();
    // } else if (afterMonster && afterMonster.hasAbility(Ability.WEAPONS_TRAINING)) {
    //   weaponsTrainingDamage = afterMonster.getPostAbilityMelee();
    // }
    // return weaponsTrainingDamage;
  }

  getPostAbilityMaxArmor() {
    let maxArmor = this.startingArmor;
    if (this.getIsLastStand()) {
      maxArmor = Math.ceil(maxArmor * abilityUtils.LAST_STAND_MULTIPLIER);
    }
    if (this.hasBuff(Ability.PROTECT)) {
      const protectAmt = this.getBuffAmt(Ability.PROTECT);
      maxArmor = maxArmor + abilityUtils.PROTECT_AMOUNT * protectAmt;
    }
    maxArmor = Math.max(maxArmor + this.summonerArmor, 0);
    if (this.hasDebuff(Ability.RUST)) {
      const rustAmt = this.getDebuffAmt(Ability.RUST);
      maxArmor = Math.max(maxArmor - abilityUtils.RUST_AMOUNT * rustAmt, 0);
    }
    return maxArmor;
  }

  getPostAbilitySpeed() {
    let speedModifier = 0;
    let speed = Math.max(this.speed + this.summonerSpeed, 1);
    if (this.getIsLastStand()) {
      speed = Math.ceil(speed * abilityUtils.LAST_STAND_MULTIPLIER);
    }
    if (this.isEnraged()) {
      speed = Math.ceil(speed * abilityUtils.ENRAGE_MULTIPLIER);
    }
    if (this.hasBuff(Ability.SWIFTNESS)) {
      const swiftnessAmount = this.getBuffAmt(Ability.SWIFTNESS);
      speedModifier += swiftnessAmount;
    }
    if (this.hasDebuff(Ability.SLOW)) {
      const slowAmt = this.getDebuffAmt(Ability.SLOW);
      speedModifier -= slowAmt;
    }
    return Math.max(speed + speedModifier, 1);
  }

  getPostAbilityMaxHealth() {
    let maxHealth = Math.max(this.startingHealth, 1);
    // Life leech and scavenger are affected by last stand multiplier
    if (this.hasBuff(Ability.LIFE_LEECH)) {
      const lifeLeechAmt = this.getBuffAmt(Ability.LIFE_LEECH);
      maxHealth = maxHealth + abilityUtils.LIFE_LEECH_AMOUNT * lifeLeechAmt;
    }
    if (this.hasBuff(Ability.SCAVENGER)) {
      const scavengerAmt = this.getBuffAmt(Ability.SCAVENGER);
      maxHealth = maxHealth + abilityUtils.SCAVENGER_AMOUNT * scavengerAmt;
    }
    if (this.hasDebuff(Ability.CRIPPLE)) {
      const crippleAmt = this.getDebuffAmt(Ability.CRIPPLE);
      maxHealth = maxHealth - abilityUtils.CRIPPLE_AMOUNT * crippleAmt;
    }
    if (this.hasDebuff(Ability.WEAKEN)) {
      const weakenAmt = this.getDebuffAmt(Ability.WEAKEN);
      maxHealth = maxHealth - abilityUtils.WEAKEN_AMOUNT * weakenAmt;
    }
    if (this.hasBuff(Ability.STRENGTHEN)) {
      const strAmt = this.getBuffAmt(Ability.STRENGTHEN);
      maxHealth = maxHealth + abilityUtils.STRENGTHEN_AMOUNT * strAmt;
    }
    if (this.getIsLastStand()) {
      maxHealth = Math.ceil(maxHealth * abilityUtils.LAST_STAND_MULTIPLIER);
    }
    // The summoner skill made this starting health 0 or negative
    if (this.startingHealth < 1) {
      maxHealth = maxHealth + this.startingHealth - 1;
    }

    return Math.max(maxHealth, 1);
  }

  getPostAbilityAttackOfType(attackType: AttackType) {
    if (attackType === AttackType.MAGIC) {
      return this.getPostAbilityMagic();
    }
    if (attackType === AttackType.RANGED) {
      return this.getPostAbilityRanged();
    }
    if (attackType === AttackType.MELEE) {
      return this.getPostAbilityMelee();
    }
    return 0;
  }

  /**  How much magic damage this will do */
  getPostAbilityMagic() {
    if (this.magic === 0) {
      return 0;
    }
    let postMagic = this.magic + this.summonerMagic;
    if (this.hasDebuff(Ability.HALVING)) {
      postMagic = Math.max(Math.floor(postMagic / 2), 1);
    }
    if (this.getIsLastStand()) {
      postMagic = Math.ceil(postMagic * abilityUtils.LAST_STAND_MULTIPLIER);
    }
    let magicModifier = 0;
    for (let i = 0; i < this.getDebuffAmt(Ability.SILENCE); i++) {
      magicModifier--;
    }
    return Math.max(postMagic + magicModifier, 1);
  }

  /** How much ranged damage this will do */
  getPostAbilityRanged() {
    if (this.ranged === 0) {
      return 0;
    }
    let postRange = this.ranged + this.summonerRanged;
    if (this.hasDebuff(Ability.HALVING)) {
      postRange = Math.max(Math.floor(postRange / 2), 1);
    }
    if (this.getIsLastStand()) {
      postRange = Math.ceil(postRange * abilityUtils.LAST_STAND_MULTIPLIER);
    }
    let rangeModifier = 0;
    if (this.hasDebuff(Ability.HEADWINDS)) {
      const headwindsAmt = this.getDebuffAmt(Ability.HEADWINDS);
      rangeModifier -= headwindsAmt;
    }
    return Math.max(postRange + rangeModifier, 1);
  }

  /** How much melee damage this will do */
  getPostAbilityMelee(): number {
    let postMelee = this.melee + this.getWeaponsTrainingDamage();
    if (postMelee === 0) {
      return 0;
    }
    postMelee += this.summonerMelee;
    if (this.hasDebuff(Ability.HALVING)) {
      postMelee = Math.max(Math.floor(postMelee / 2), 1);
    }
    if (this.getIsLastStand()) {
      postMelee = Math.ceil(postMelee * abilityUtils.LAST_STAND_MULTIPLIER);
    }
    let meleeModifier = 0;
    if (this.hasBuff(Ability.INSPIRE)) {
      const inspireAmt = this.getBuffAmt(Ability.INSPIRE);
      meleeModifier += inspireAmt;
    }
    if (this.hasDebuff(Ability.DEMORALIZE)) {
      const demoralizeAmt = this.getDebuffAmt(Ability.DEMORALIZE);
      meleeModifier -= demoralizeAmt;
    }

    const currentMelee = Math.max(postMelee + meleeModifier, 1);
    if (this.isEnraged()) {
      return Math.ceil(currentMelee * abilityUtils.ENRAGE_MULTIPLIER);
    }
    return currentMelee;
  }

  resurrect() {
    if (this.health > 0) {
      throw new Error("Can't resurrect a monster that is not dead");
    }
    this.health = 1;
    if (this.hadDivineShield) {
      this.addAbility(Ability.DIVINE_SHIELD);
    }
    this.armor = this.getPostAbilityMaxArmor();
    // this.cleanseDebuffs();
  }

  public getCleanCard(): GameMonster {
    return new GameMonster(this.getCardDetail(), this.getCardLevel() + 1);
  }

  /********************* Things regarding abilities? ********************/
  private isEnraged() {
    return this.hasAbility(Ability.ENRAGE) && this.health < this.getPostAbilityMaxHealth();
  }
}
