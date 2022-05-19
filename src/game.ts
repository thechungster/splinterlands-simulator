import { GameTeam } from './game_team';
import * as rulesetUtils from './utils/ruleset_utils';
import {
  Ability,
  AdditionalBattleAction,
  AttackType,
  BattleDamage,
  BattleLog,
  BattleLogAction,
  Ruleset,
} from './types';
import { GameSummoner } from './game_summoner';
import { GameMonster } from './game_monster';
import {
  MONSTER_BUFF_ABILITIES,
  MONSTER_DEBUFF_ABILITIES,
  SUMMONER_ABILITY_ABILITIES,
  SUMMONER_BUFF_ABILITIES,
  SUMMONER_DEBUFF_ABILITIES,
} from './utils/ability_utils';
import * as abilityUtils from './utils/ability_utils';
import * as gameUtils from './utils/game_utils';
import * as damageUtils from './utils/damage_utils';
import { GameCard } from './game_card';
import { TeamNumber } from './types';

const FATIGUE_ROUND_NUMBER = 20;

export class Game {
  private readonly team1: GameTeam;
  private readonly team2: GameTeam;
  private readonly rulesets: Set<Ruleset>;
  private readonly battleLogs: BattleLog[] = [];
  private readonly shouldLog: boolean;
  // 0 = tie
  // 1 = team1
  // 2 = team2
  private winner: number | undefined;
  private deadMonsters: GameMonster[] = [];
  private roundNumber = 0;
  constructor(
    team1: GameTeam,
    team2: GameTeam,
    rulesets: Set<Ruleset>,
    shouldLog: boolean = false,
  ) {
    this.team1 = team1;
    this.team2 = team2;
    this.rulesets = rulesets;
    this.shouldLog = shouldLog;

    this.team1.setTeam(TeamNumber.ONE);
    this.team2.setTeam(TeamNumber.TWO);
  }

  public getWinner() {
    return this.winner;
  }

  public playGame() {
    this.roundNumber = 0;
    const team1Summoner = this.team1.getSummoner();
    const team1Monsters = this.team1.getMonstersList();
    const team2Summoner = this.team2.getSummoner();
    const team2Monsters = this.team2.getMonstersList();

    // Pre game rulesets
    rulesetUtils.doRulesetPreGameBuff(this.rulesets, this.team1, this.team2);

    // Summoner pregame buffs
    this.doSummonerPreGameBuff(team1Summoner, team1Monsters);
    this.doSummonerPreGameBuff(team2Summoner, team2Monsters);

    // Monsters pregame buffs
    this.doMonsterPreGameBuff(team1Monsters);
    this.doMonsterPreGameBuff(team2Monsters);

    // Summoner pregame debuffs
    this.doSummonerPreGameDebuff(team1Summoner, team2Monsters);
    this.doSummonerPreGameDebuff(team2Summoner, team1Monsters);

    // Monsters do pregame debuffs
    this.doMonsterPreGameDebuff(team1Monsters, team2Monsters);

    // Apply ruleset rules that apply post buff phase
    rulesetUtils.doRulesetPreGamePostBuff(this.rulesets, this.team1, this.team2);

    this.team1.setAllMonsterHealth();
    this.team2.setAllMonsterHealth();
    this.playRoundsUntilGameEnd();
  }

  public getBattleLogs() {
    if (!this.shouldLog) {
      throw new Error(
        'You must instantiate the Game with enableLogs as true in the constructor in order to have logs',
      );
    }
    return this.battleLogs;
  }

  // Add all summoner abilities which are in SUMMONER_BUFF_ABILITIES
  private doSummonerPreGameBuff(summoner: GameSummoner, friendlyMonsters: GameMonster[]) {
    for (const ability of SUMMONER_BUFF_ABILITIES) {
      if (summoner.hasAbility(ability)) {
        this.applyBuffToMonsters(friendlyMonsters, ability);
      }
    }

    for (const ability of SUMMONER_ABILITY_ABILITIES) {
      if (summoner.hasAbility(ability)) {
        this.applyAbilityToMonsters(friendlyMonsters, ability);
      }
    }

    for (const monster of friendlyMonsters) {
      if (summoner.armor > 0) {
        monster.addSummonerArmor(summoner.armor);
      }
      if (summoner.health > 0) {
        monster.addSummonerHealth(summoner.health);
      }
      if (summoner.speed > 0) {
        monster.addSummonerSpeed(summoner.speed);
      }
      if (summoner.melee > 0) {
        monster.addSummonerMelee(summoner.melee);
      }
      if (summoner.ranged > 0) {
        monster.addSummonerRanged(summoner.ranged);
      }
      if (summoner.magic > 0) {
        monster.addSummonerMagic(summoner.magic);
      }
    }
  }

  // Add all monster abilities to all friendly monsters which are in MONSTER_BUFF_ABILITIES
  private doMonsterPreGameBuff(friendlyMonsters: GameMonster[]) {
    for (const monster of friendlyMonsters)
      for (const buff of MONSTER_BUFF_ABILITIES) {
        if (!monster.hasAbility(buff)) {
          continue;
        }
        this.applyBuffToMonsters(friendlyMonsters, buff);
      }
  }

  // Add all summoner abilities to all enemy monsters which are in SUMMONER_DEBUFF_ABILITIES
  private doSummonerPreGameDebuff(summoner: GameSummoner, enemyMonsters: GameMonster[]) {
    for (const debuff of SUMMONER_DEBUFF_ABILITIES) {
      if (!summoner.hasAbility(debuff)) {
        continue;
      }
      this.applyDebuffToMonsters(enemyMonsters, debuff);
    }

    for (const monster of enemyMonsters) {
      if (summoner.armor < 0) {
        monster.addSummonerArmor(summoner.armor);
      }
      if (summoner.health < 0) {
        monster.addSummonerHealth(summoner.health);
      }
      if (summoner.speed < 0) {
        monster.addSummonerSpeed(summoner.speed);
      }
      if (summoner.melee < 0) {
        monster.addSummonerMelee(summoner.melee);
      }
      if (summoner.ranged < 0) {
        monster.addSummonerRanged(summoner.ranged);
      }
      if (summoner.magic < 0) {
        monster.addSummonerMagic(summoner.magic);
      }
    }
  }

  private doMonsterPreGameDebuff(team1Monsters: GameMonster[], team2Monsters: GameMonster[]) {
    for (const debuff of MONSTER_DEBUFF_ABILITIES) {
      for (const monster of team1Monsters) {
        if (!monster.hasAbility(debuff)) {
          continue;
        }
        this.applyDebuffToMonsters(team2Monsters, debuff);
      }
      for (const monster of team2Monsters) {
        if (!monster.hasAbility(debuff)) {
          continue;
        }
        this.applyDebuffToMonsters(team1Monsters, debuff);
      }
    }
  }

  private doSummonerPreRound(team: GameTeam) {
    const summoner = team.getSummoner();
    if (summoner.hasAbility(Ability.CLEANSE)) {
      const firstMonster = team.getFirstAliveMonster();
      firstMonster.cleanseDebuffs();
      this.createAndAddBattleLog(Ability.CLEANSE, summoner, firstMonster);
    }
    if (summoner.hasAbility(Ability.REPAIR)) {
      const repairTarget = team.getRepairTarget();
      if (repairTarget) {
        abilityUtils.repairMonsterArmor(repairTarget);
        this.createAndAddBattleLog(Ability.REPAIR, summoner, repairTarget || undefined);
      }
    }
    if (summoner.hasAbility(Ability.TANK_HEAL)) {
      const firstMonster = team.getFirstAliveMonster();
      abilityUtils.tankHealMonster(firstMonster);
      this.createAndAddBattleLog(Ability.TANK_HEAL, summoner, firstMonster || undefined);
    }
    if (summoner.hasAbility(Ability.TRIAGE)) {
      const healTarget = team.getTriageHealTarget();
      if (healTarget) {
        const healAmt = abilityUtils.triageHealMonster(healTarget);
        this.createAndAddBattleLog(Ability.TRIAGE, summoner, healTarget, healAmt);
      }
    }
  }

  private doMonsterPreTurn(monster: GameMonster) {
    monster.setHasTurnPassed(true);
    const friendlyTeam = this.getTeamOfMonster(monster);

    if (monster.hasAbility(Ability.CLEANSE)) {
      const cleanseTarget = friendlyTeam.getFirstAliveMonster();
      cleanseTarget.cleanseDebuffs();
      this.createAndAddBattleLog(Ability.CLEANSE, monster, cleanseTarget);
    }
    if (monster.hasAbility(Ability.TANK_HEAL)) {
      const tankHealTarget = friendlyTeam.getFirstAliveMonster();
      const healAmt = abilityUtils.tankHealMonster(tankHealTarget);
      this.createAndAddBattleLog(Ability.TANK_HEAL, monster, tankHealTarget, healAmt);
    }
    if (monster.hasAbility(Ability.REPAIR)) {
      const friendlyGameTeam = this.getTeamOfMonster(monster);
      const repairTarget = friendlyGameTeam.getRepairTarget();
      if (repairTarget) {
        const repairAmt = abilityUtils.repairMonsterArmor(repairTarget);
        this.createAndAddBattleLog(Ability.REPAIR, monster, repairTarget, repairAmt);
      }
    }
    if (monster.hasAbility(Ability.TRIAGE)) {
      const friendlyGameTeam = this.getTeamOfMonster(monster);
      const triageTarget = friendlyGameTeam.getTriageHealTarget();
      if (triageTarget) {
        const healAmt = abilityUtils.triageHealMonster(triageTarget);
        this.createAndAddBattleLog(Ability.TRIAGE, monster, triageTarget, healAmt);
      }
    }
    if (monster.hasAbility(Ability.HEAL)) {
      const healAmt = abilityUtils.selfHeal(monster);
      this.createAndAddBattleLog(Ability.HEAL, monster, monster, healAmt);
    }
  }

  private resolveAttackForMonster(monsterAttacking: GameMonster) {
    const currentDeadMonsters = this.deadMonsters.length;
    if (!monsterAttacking.hasAttack()) {
      return;
    }
    // Attack with magic
    if (monsterAttacking.magic > 0) {
      const attackTarget = this.getTargetForAttackType(monsterAttacking, AttackType.MAGIC);
      if (attackTarget !== null) {
        this.attackMonsterPhase(monsterAttacking, attackTarget, AttackType.MAGIC);
      }
    }
    // Attack with ranged
    if (monsterAttacking.ranged > 0) {
      const attackTarget = this.getTargetForAttackType(monsterAttacking, AttackType.RANGED);
      if (attackTarget !== null) {
        this.attackMonsterPhase(monsterAttacking, attackTarget, AttackType.RANGED);
      }
    }
    // Attack with melee
    if (monsterAttacking.melee > 0) {
      const attackTarget = this.getTargetForAttackType(monsterAttacking, AttackType.MELEE);
      if (attackTarget !== null) {
        this.resolveMeleeAttackForMonster(monsterAttacking, attackTarget, false);
      }
    }
    // Check bloodlust
    if (
      this.deadMonsters.length > currentDeadMonsters &&
      monsterAttacking.hasAbility(Ability.BLOODLUST)
    ) {
      this.maybeApplyBloodlust(
        monsterAttacking,
        /* isReverseSpeed */ this.rulesets.has(Ruleset.REVERSE_SPEED),
      );
    }
  }

  private resolveMeleeAttackForMonster(
    monsterAttacking: GameMonster,
    attackTarget: GameMonster,
    hasTrampled: boolean,
  ) {
    const currentDeadMonsters = this.deadMonsters.length;
    const enemyTeam = this.getTeamOfMonster(attackTarget);
    const monsterPosition = enemyTeam.getMonsterPosition(attackTarget);
    const nextMonster = enemyTeam.getAliveMonsters()[monsterPosition + 1];
    this.attackMonsterPhase(monsterAttacking, attackTarget, AttackType.MELEE);
    // Check trample
    if (
      !hasTrampled &&
      nextMonster &&
      monsterAttacking.hasAbility(Ability.TRAMPLE) &&
      this.deadMonsters.length > currentDeadMonsters
    ) {
      this.resolveMeleeAttackForMonster(
        monsterAttacking,
        nextMonster,
        !this.rulesets.has(Ruleset.STAMPEDE),
      );
    }
  }

  private attackMonsterPhase(
    attackingMonster: GameMonster,
    attackTarget: GameMonster,
    attackType: AttackType,
  ) {
    if (attackingMonster.hasAbility(Ability.RECHARGE) && this.roundNumber % 2 === 0) {
      return;
    }
    // See if it dodged.
    if (
      !this.rulesets.has(Ruleset.AIM_TRUE) &&
      gameUtils.getDidDodge(this.rulesets, attackingMonster, attackTarget, attackType)
    ) {
      this.createAndAddBattleLog(Ability.DODGE, attackingMonster, attackTarget);
      if (attackTarget.hasAbility(Ability.BACKFIRE)) {
        const backfireBattleDamage = damageUtils.hitMonsterWithPhysical(
          attackingMonster,
          abilityUtils.BACKFIRE_DAMAGE,
        );
        this.createAndAddBattleLog(
          Ability.BACKFIRE,
          attackingMonster,
          attackTarget,
          backfireBattleDamage.damageDone,
        );
      }
      this.maybeDead(attackingMonster);
      return;
    }

    const damageMultipliers = this.getDamageMultiplier(attackingMonster, attackTarget);
    const damageAmt = attackingMonster.getPostAbilityAttackOfType(attackType) * damageMultipliers;
    const attackedTeam = this.getTeamOfMonster(attackTarget);
    const attackedPosition = attackedTeam.getMonsterPosition(attackTarget);
    const attackedAliveMonsters = attackedTeam.getAliveMonsters();
    const prevMonster = attackedAliveMonsters[attackedPosition - 1] || null;
    const nextMonster = attackedAliveMonsters[attackedPosition + 1] || null;
    // No dodge, continue as normal.
    // Snare monster
    if (
      attackTarget.hasAbility(Ability.FLYING) &&
      attackingMonster.hasAbility(Ability.SNARE) &&
      !attackTarget.hasDebuff(Ability.SNARE)
    ) {
      this.addMonsterToMonsterDebuff(attackingMonster, attackTarget, Ability.SNARE);
    }

    // No damage if there's divine shield, but it will still trigger stun, thorns, poison, blast,
    if (attackTarget.hasAbility(Ability.DIVINE_SHIELD)) {
      attackTarget.removeDivineShield();
      if (attackType === AttackType.MAGIC) {
        this.maybeApplyMagicReflect(attackingMonster, attackTarget, attackType);
      } else {
        this.maybeApplyThorns(attackingMonster, attackTarget, attackType);
        this.maybeApplyReturnFire(attackingMonster, attackTarget, attackType);
        this.maybeRetaliate(attackingMonster, attackTarget, attackType);
      }

      // Check if dead
      this.maybeDead(attackingMonster);
      this.maybeDead(attackTarget);

      // Do buffs
      this.maybeApplyStun(attackingMonster, attackTarget);
      this.maybeApplyPoison(attackingMonster, attackTarget);
      this.maybeApplyCripple(attackingMonster, attackTarget);
      this.maybeApplyHalving(attackingMonster, attackTarget);
      this.maybeBlast(attackingMonster, prevMonster, attackType, damageAmt);
      this.maybeBlast(attackingMonster, nextMonster, attackType, damageAmt);
      return;
    }

    const battleDamage = this.actuallyHitMonster(attackingMonster, attackTarget, attackType);
    this.createAndAddBattleLog(attackType, attackingMonster, attackTarget, battleDamage.damageDone);

    // Pierce
    if (attackingMonster.hasAbility(Ability.PIERCING) && battleDamage.remainder > 0) {
      if (attackType === AttackType.MAGIC) {
        damageUtils.hitMonsterWithMagic(attackTarget, battleDamage.remainder);
      } else {
        damageUtils.hitMonsterWithPhysical(attackTarget, battleDamage.remainder);
      }
    }

    // TODO: This doesn't account for the pierce.
    this.maybeLifeLeech(attackingMonster, battleDamage.attack);
    this.maybeApplyThorns(attackingMonster, attackTarget, attackType);
    this.maybeApplyMagicReflect(attackingMonster, attackTarget, attackType);
    this.maybeApplyReturnFire(attackingMonster, attackTarget, attackType);
    this.maybeRetaliate(attackingMonster, attackTarget, attackType);
    this.maybeApplyHalving(attackingMonster, attackTarget);

    // Check if dead
    this.maybeDead(attackingMonster);
    this.maybeDead(attackTarget);

    this.maybeBlast(attackingMonster, prevMonster, attackType, damageAmt);
    this.maybeBlast(attackingMonster, nextMonster, attackType, damageAmt);

    // Shatter
    if (attackingMonster.hasAbility(Ability.SHATTER)) {
      attackTarget.armor = 0;
    }

    // Stun
    this.maybeApplyStun(attackingMonster, attackTarget);

    // Poison
    this.maybeApplyPoison(attackingMonster, attackTarget);
    // Cripple
    this.maybeApplyCripple(attackingMonster, attackTarget);

    // Affliction
    if (
      attackingMonster.hasAbility(Ability.AFFLICTION) &&
      !attackTarget.hasDebuff(Ability.AFFLICTION) &&
      gameUtils.getSuccessBelow(abilityUtils.AFFLICTION_CHANCE * 100)
    ) {
      this.createAndAddBattleLog(
        Ability.AFFLICTION,
        attackingMonster,
        attackTarget,
        battleDamage.damageDone,
      );
      this.addMonsterToMonsterDebuff(attackingMonster, attackTarget, Ability.AFFLICTION);
    }

    // Dispel
    if (attackingMonster.hasAbility(Ability.DISPEL)) {
      abilityUtils.dispelBuffs(attackTarget);
    }
  }

  /** Actually hits the monster. Returns the remainder damage (i.e. if there is 1 shield, and it does 4 melee damage, returns 3.) */
  private actuallyHitMonster(
    attackingMonster: GameMonster,
    attackTarget: GameMonster,
    attackType: AttackType,
  ): BattleDamage {
    const damageMultipliers = this.getDamageMultiplier(attackingMonster, attackTarget);
    const damageAmt = attackingMonster.getPostAbilityAttackOfType(attackType) * damageMultipliers;
    let battleDamage = {
      attack: 0,
      damageDone: 0,
      remainder: 0,
    };
    if (attackType === AttackType.MAGIC) {
      battleDamage = damageUtils.hitMonsterWithMagic(attackTarget, damageAmt);
    } else if (attackType === AttackType.RANGED) {
      battleDamage = damageUtils.hitMonsterWithPhysical(attackTarget, damageAmt);
    } else if (attackType === AttackType.MELEE) {
      battleDamage = damageUtils.hitMonsterWithPhysical(attackTarget, damageAmt);
    }

    return battleDamage;
  }

  private getDamageMultiplier(attackingMonster: GameMonster, attackTarget: GameMonster): number {
    let multiplier = 1;
    if (attackingMonster.hasAbility(Ability.RECHARGE)) {
      multiplier *= 3;
    }
    if (attackingMonster.hasAbility(Ability.GIANT_KILLER) && attackTarget.mana >= 10) {
      multiplier *= 2;
    }
    if (attackTarget.isLastMonster() && attackingMonster.hasAbility(Ability.DEATHBLOW)) {
      multiplier *= 2;
    }
    if (attackTarget.hasDebuff(Ability.STUN) && attackingMonster.hasAbility(Ability.KNOCK_OUT)) {
      multiplier *= 2;
    }
    if (!attackTarget.hasAttack() && attackingMonster.hasAbility(Ability.OPPRESS)) {
      multiplier *= 2;
    }
    return multiplier;
  }

  private getPostBlastDamageMultiplier(attackingMonster: GameMonster, attackTarget: GameMonster) {
    let multiplier = 1;
    if (attackingMonster.hasAbility(Ability.RECHARGE)) {
      multiplier *= 3;
    }
    if (attackingMonster.hasAbility(Ability.GIANT_KILLER) && attackTarget.mana >= 10) {
      multiplier *= 2;
    }
    if (attackTarget.hasDebuff(Ability.STUN) && attackingMonster.hasAbility(Ability.KNOCK_OUT)) {
      multiplier *= 2;
    }
    if (!attackTarget.hasAttack() && attackingMonster.hasAbility(Ability.OPPRESS)) {
      multiplier *= 2;
    }
    return multiplier;
  }

  private getTargetForNonMelee(monster: GameMonster): GameMonster | null {
    const enemyTeam = this.getEnemyTeamOfMonster(monster);
    if (monster.hasAbility(Ability.SCATTERSHOT)) {
      return enemyTeam.getScattershotTarget();
    }
    const tauntMonster = enemyTeam.getTauntMonster();
    if (tauntMonster !== null) {
      return tauntMonster;
    }
    if (monster.hasAbility(Ability.SNEAK)) {
      return enemyTeam.getSneakTarget();
    }
    if (monster.hasAbility(Ability.SNIPE)) {
      return enemyTeam.getSnipeTarget();
    }
    if (monster.hasAbility(Ability.OPPORTUNITY)) {
      return enemyTeam.getOpportunityTarget();
    }
    return enemyTeam.getFirstAliveMonster();
  }

  private getTargetForMagicAttack(monster: GameMonster): GameMonster | null {
    const friendlyTeam = this.getTeamOfMonster(monster);
    const monsterPosition = friendlyTeam.getMonsterPosition(monster);
    if (monsterPosition === 0) {
      return this.getEnemyTeamOfMonster(monster).getFirstAliveMonster() || null;
    }
    return this.getTargetForNonMelee(monster);
  }

  private getTargetForRangedAttack(monster: GameMonster): GameMonster | null {
    const hasCloseRange = monster.hasAbility(Ability.CLOSE_RANGE);
    const monsterTeam = this.getTeamOfMonster(monster);
    const monsterPosition = monsterTeam.getMonsterPosition(monster);
    if (hasCloseRange && monsterPosition === 0) {
      return this.getEnemyTeamOfMonster(monster).getFirstAliveMonster();
    }
    if (monsterPosition === 0) {
      return null;
    }
    return this.getTargetForNonMelee(monster);
  }

  private getTargetForMeleeAttack(monster: GameMonster): GameMonster | null {
    const friendlyTeam = this.getTeamOfMonster(monster);
    const enemyTeam = this.getEnemyTeamOfMonster(monster);
    const monsterPosition = friendlyTeam.getMonsterPosition(monster);
    if (monsterPosition === 0) {
      return enemyTeam.getFirstAliveMonster();
    }
    if (monster.hasAbility(Ability.SNEAK)) {
      return enemyTeam.getSneakTarget();
    }
    if (monster.hasAbility(Ability.OPPORTUNITY)) {
      return enemyTeam.getOpportunityTarget();
    }
    if (monster.hasAbility(Ability.MELEE_MAYHEM)) {
      return enemyTeam.getFirstAliveMonster();
    }
    if (monsterPosition === 1 && monster.hasAbility(Ability.REACH)) {
      return enemyTeam.getFirstAliveMonster();
    }
    return null;
  }

  /** Who this monster will target, if any. Null if none. */
  private getTargetForAttackType(monster: GameMonster, attackType: AttackType): GameMonster | null {
    if (!monster.isAlive()) {
      return null;
    }
    if (this.getEnemyTeamOfMonster(monster).getAliveMonsters().length === 0) {
      return null;
    }
    if (attackType === AttackType.MAGIC) {
      return this.getTargetForMagicAttack(monster);
    } else if (attackType === AttackType.RANGED) {
      return this.getTargetForRangedAttack(monster);
    } else if (attackType === AttackType.MELEE) {
      return this.getTargetForMeleeAttack(monster);
    }
    return null;
  }

  // Blast has a ton of edge cases... https://support.splinterlands.com/hc/en-us/articles/4414966685332-Abilities-Status-Effects
  private maybeBlast(
    attackingMonster: GameMonster,
    monsterToBlast: GameMonster,
    attackType: AttackType,
    damageDone: number,
  ) {
    if (!attackingMonster.hasAbility(Ability.BLAST) || monsterToBlast === null) {
      return;
    }
    const baseBlastDamage = Math.ceil(damageDone / 2);
    const damageMultiplier = this.getPostBlastDamageMultiplier(attackingMonster, monsterToBlast);
    let blastDamage = baseBlastDamage * damageMultiplier;

    if (
      monsterToBlast.hasAbility(Ability.FORCEFIELD) &&
      baseBlastDamage >= abilityUtils.FORCEFIELD_MIN_DAMAGE
    ) {
      blastDamage = 1;
    }
    // Blasted monsters get snared
    if (
      monsterToBlast.hasAbility(Ability.FLYING) &&
      attackingMonster.hasAbility(Ability.SNARE) &&
      !monsterToBlast.hasDebuff(Ability.SNARE)
    ) {
      this.addMonsterToMonsterDebuff(attackingMonster, monsterToBlast, Ability.SNARE);
    }

    if (attackType === AttackType.MAGIC) {
      const battleDamage = damageUtils.hitMonsterWithMagic(monsterToBlast, blastDamage);
      this.createAndAddBattleLog(
        Ability.BLAST,
        attackingMonster,
        monsterToBlast,
        battleDamage.damageDone,
      );
      this.maybeApplyMagicReflect(
        attackingMonster,
        monsterToBlast,
        attackType,
        battleDamage.attack,
      );
      this.maybeLifeLeech(attackingMonster, blastDamage - battleDamage.remainder);
    } else {
      const battleDamage = damageUtils.hitMonsterWithPhysical(monsterToBlast, blastDamage);
      this.createAndAddBattleLog(
        Ability.BLAST,
        attackingMonster,
        monsterToBlast,
        battleDamage.damageDone,
      );
      this.maybeApplyReturnFire(attackingMonster, monsterToBlast, attackType, battleDamage.attack);
    }
    this.maybeDead(monsterToBlast);
    this.maybeDead(attackingMonster);
  }

  private maybeDead(monster: GameMonster) {
    if (monster.isAlive() || this.deadMonsters.indexOf(monster) > -1) {
      return;
    }

    this.createAndAddBattleLog(AdditionalBattleAction.DEATH, monster);
    this.deadMonsters.push(monster);
    monster.setHasTurnPassed(true);
    // Monster just died!
    const friendlyTeam = this.getTeamOfMonster(monster);
    const aliveFriendlyTeam = friendlyTeam.getAliveMonsters();
    const enemyTeam = this.getEnemyTeamOfMonster(monster).getAliveMonsters();

    // Redemption
    if (monster.hasAbility(Ability.REDEMPTION)) {
      enemyTeam.forEach((enemy: GameMonster) => {
        const battleDamage = damageUtils.hitMonsterWithPhysical(
          enemy,
          abilityUtils.REDEMPTION_DAMAGE,
        );

        this.maybeDead(enemy);
      });
    }

    // Remove debuffs from enemy team
    MONSTER_DEBUFF_ABILITIES.forEach((debuff: Ability) => {
      if (monster.hasAbility(debuff)) {
        enemyTeam.forEach((enemy: GameMonster) => {
          enemy.removeDebuff(debuff);
        });
      }
    });

    // Remove buffs from friendly
    MONSTER_BUFF_ABILITIES.forEach((buff: Ability) => {
      if (monster.hasAbility(buff)) {
        aliveFriendlyTeam.forEach((friendly: GameMonster) => {
          friendly.removeBuff(buff);
        });
      }
    });

    this.maybeResurrect(friendlyTeam.getSummoner(), monster);
    aliveFriendlyTeam.forEach((friendly: GameMonster) => {
      this.maybeResurrect(friendly, monster);
    });
    aliveFriendlyTeam.forEach((friendly: GameMonster) => {
      this.onDeath(friendly, monster);
    });
    enemyTeam.forEach((enemy: GameMonster) => {
      this.onDeath(enemy, monster);
    });

    friendlyTeam.maybeSetLastStand();
  }

  private maybeResurrect(monster: GameCard, deadMonster: GameMonster) {
    if (monster.hasAbility(Ability.RESURRECT) && !deadMonster.isAlive()) {
      monster.removeAbility(Ability.RESURRECT);
      deadMonster.resurrect();
      const deadMonsterIndex = this.deadMonsters.findIndex((deadMon) => deadMon === deadMonster);
      deadMonster.armor = deadMonster.startingArmor;
      this.deadMonsters.splice(deadMonsterIndex, 1);
      this.createAndAddBattleLog(Ability.RESURRECT, monster, deadMonster);
    }
  }

  private onDeath(monster: GameMonster, deadMonster: GameMonster) {
    if (monster.hasAbility(Ability.SCAVENGER)) {
      monster.addBuff(Ability.SCAVENGER);
      this.createAndAddBattleLog(Ability.SCAVENGER, monster, deadMonster);
    }
  }

  private maybeApplyThorns(
    attackingMonster: GameMonster,
    attackTarget: GameMonster,
    attackType: AttackType,
  ) {
    if (attackTarget.hasAbility(Ability.THORNS) && attackType === AttackType.MELEE) {
      const thornsDamage = attackTarget.hasBuff(Ability.AMPLIFY)
        ? abilityUtils.THORNS_DAMAGE + 1
        : abilityUtils.THORNS_DAMAGE;
      const battleDamage = damageUtils.hitMonsterWithPhysical(attackingMonster, thornsDamage);
      this.createAndAddBattleLog(
        Ability.THORNS,
        attackTarget,
        attackingMonster,
        battleDamage.damageDone,
      );
    }
  }

  private maybeApplyMagicReflect(
    attackingMonster: GameMonster,
    attackTarget: GameMonster,
    attackType: AttackType,
    attackDamage?: number | undefined,
  ) {
    if (!attackTarget.hasAbility(Ability.MAGIC_REFLECT) || attackType !== AttackType.MAGIC) {
      return;
    }
    attackDamage = attackDamage === 0 ? 1 : attackDamage;
    let reflectDamage =
      attackDamage !== undefined
        ? Math.ceil(attackDamage / 2)
        : Math.ceil(attackingMonster.getPostAbilityMagic() / 2);
    if (attackTarget.hasBuff(Ability.AMPLIFY)) {
      reflectDamage++;
    }
    const battleDamage = damageUtils.hitMonsterWithMagic(attackingMonster, reflectDamage);
    this.createAndAddBattleLog(
      Ability.MAGIC_REFLECT,
      attackTarget,
      attackingMonster,
      battleDamage.damageDone,
    );
  }

  private maybeApplyReturnFire(
    attackingMonster: GameMonster,
    attackTarget: GameMonster,
    attackType: AttackType,
    attackDamage?: number | undefined,
  ) {
    if (!attackTarget.hasAbility(Ability.RETURN_FIRE) || attackType !== AttackType.RANGED) {
      return;
    }
    attackDamage = attackDamage === 0 ? 1 : attackDamage;
    let reflectDamage =
      attackDamage !== undefined
        ? Math.ceil(attackDamage / 2)
        : Math.ceil(attackingMonster.getPostAbilityRanged() / 2);
    if (attackTarget.hasBuff(Ability.AMPLIFY)) {
      reflectDamage++;
    }
    const battleDamage = damageUtils.hitMonsterWithPhysical(attackingMonster, reflectDamage);
    this.createAndAddBattleLog(
      Ability.RETURN_FIRE,
      attackTarget,
      attackingMonster,
      battleDamage.damageDone,
    );
  }

  private maybeRetaliate(
    attackingMonster: GameMonster,
    attackTarget: GameMonster,
    attackType: AttackType,
  ) {
    if (
      !attackTarget.hasAbility(Ability.RETALIATE) ||
      attackType !== AttackType.MELEE ||
      gameUtils.getSuccessBelow(abilityUtils.RETALIATE_CHANCE * 100)
    ) {
      return;
    }
    this.createAndAddBattleLog(Ability.RETALIATE, attackTarget, attackingMonster);
    this.attackMonsterPhase(attackTarget, attackingMonster, AttackType.MELEE);
  }

  private maybeApplyStun(attackingMonster: GameMonster, attackTarget: GameMonster) {
    if (
      attackingMonster.hasAbility(Ability.STUN) &&
      gameUtils.getSuccessBelow(abilityUtils.STUN_CHANCE * 100)
    ) {
      this.addMonsterToMonsterDebuff(attackingMonster, attackTarget, Ability.STUN);
    }
  }

  private maybeApplyPoison(attackingMonster: GameMonster, attackTarget: GameMonster) {
    if (
      attackingMonster.hasAbility(Ability.POISON) &&
      gameUtils.getSuccessBelow(abilityUtils.POISON_CHANCE * 100) &&
      !attackTarget.hasDebuff(Ability.POISON) &&
      attackTarget.isAlive()
    ) {
      this.addMonsterToMonsterDebuff(attackingMonster, attackTarget, Ability.POISON);
    }
  }

  private maybeApplyCripple(attackingMonster: GameMonster, attackTarget: GameMonster) {
    if (attackingMonster.hasAbility(Ability.CRIPPLE) && attackTarget.isAlive()) {
      this.addMonsterToMonsterDebuff(attackingMonster, attackTarget, Ability.CRIPPLE);
      this.createAndAddBattleLog(Ability.CRIPPLE, attackingMonster, attackTarget);
    }
  }

  private maybeApplyHalving(attackingMonster: GameMonster, attackTarget: GameMonster) {
    if (attackingMonster.hasAbility(Ability.HALVING) && !attackTarget.hasDebuff(Ability.HALVING)) {
      this.addMonsterToMonsterDebuff(attackingMonster, attackTarget, Ability.HALVING);
      this.createAndAddBattleLog(Ability.HALVING, attackingMonster, attackTarget);
    }
  }

  private maybeApplyBloodlust(attackingMonster: GameMonster, isReverseSpeed: boolean) {
    if (!attackingMonster.hasAbility(Ability.BLOODLUST) || attackingMonster.health < 1) {
      return;
    }
    // Add attack if have attack
    if (attackingMonster.magic > 0) {
      attackingMonster.magic++;
    }
    if (attackingMonster.ranged > 0) {
      attackingMonster.ranged++;
    }
    if (attackingMonster.melee > 0) {
      attackingMonster.melee++;
    }
    if (attackingMonster.getPostAbilityMaxArmor() > 0) {
      attackingMonster.armor += 1;
    }
    const speedChange = isReverseSpeed ? -1 : 1;
    attackingMonster.speed += speedChange;
    attackingMonster.health += 1;
    this.createAndAddBattleLog(Ability.BLOODLUST, attackingMonster);
  }

  private maybeLifeLeech(attackingMonster: GameMonster, damage: number) {
    if (attackingMonster.isAlive() && attackingMonster.hasAbility(Ability.LIFE_LEECH)) {
      const lifeLeechAmt = Math.ceil(damage / 2);
      for (let i = 0; i < lifeLeechAmt; i++) {
        attackingMonster.addBuff(Ability.LIFE_LEECH);
      }
      this.createAndAddBattleLog(Ability.LIFE_LEECH, attackingMonster, undefined, lifeLeechAmt);
    }
  }

  private checkAndSetGameWinner() {
    const team1AliveMonsters = this.team1.getAliveMonsters().length;
    const team2AliveMonsters = this.team2.getAliveMonsters().length;
    if (team1AliveMonsters === 0 && team2AliveMonsters === 0) {
      this.winner = TeamNumber.UNKNOWN;
    } else if (team2AliveMonsters === 0) {
      this.winner = TeamNumber.ONE;
    } else if (team1AliveMonsters === 0) {
      this.winner = TeamNumber.TWO;
    }
  }

  /** Plays rounds until the game is over */
  private playRoundsUntilGameEnd(roundNumber = 0) {
    this.roundNumber = roundNumber;
    if (this.winner !== undefined) {
      return;
    }
    // If round >= 50, game is tie.
    if (roundNumber >= 50) {
      this.winner = TeamNumber.UNKNOWN;
      return;
    }
    // True damage that hits health on 20 rounds
    if (roundNumber >= FATIGUE_ROUND_NUMBER) {
      this.fatigueMonsters(roundNumber);
      this.checkAndSetGameWinner();
      if (this.winner !== undefined) {
        return;
      }
    }

    this.playSingleRound();
    this.checkAndSetGameWinner();
    if (this.winner !== undefined) {
      return;
    }
    this.doPostRound();
    this.checkAndSetGameWinner();

    this.playRoundsUntilGameEnd(roundNumber + 1);
  }

  /**
   * Plays a single round
   * 1. Summoners do their pre round abilities.
   * 2. Get turn order of monsters
   * 3.For each monster, check if alive then
   * 3a. Do onPreTurn
   * 3b. Get target, continue to next monster if no attack
   * 3c. Attack target
   * 3d. Resolve damage, check if dead monsters
   * 3e. (If dead) Trigger onDeath on all alive monsters and summoners
   */
  private playSingleRound() {
    this.createAndAddBattleLog(
      AdditionalBattleAction.ROUND_START,
      undefined,
      undefined,
      this.roundNumber + 1,
    );
    this.deadMonsters = [];
    this.doGamePreRound();
    this.doSummonerPreRound(this.team1);
    this.doSummonerPreRound(this.team2);
    const stunnedMonsters = [];

    let currentMonster = this.getNextMonsterTurn();
    while (currentMonster !== null) {
      if (!currentMonster.isAlive()) {
        continue;
      }
      if (currentMonster.hasDebuff(Ability.STUN)) {
        stunnedMonsters.push(currentMonster);
        currentMonster.setHasTurnPassed(true);
        currentMonster = this.getNextMonsterTurn();
        continue;
      }

      this.doMonsterPreTurn(currentMonster);
      this.resolveAttackForMonster(currentMonster);
      if (currentMonster.hasAbility(Ability.DOUBLE_STRIKE)) {
        this.resolveAttackForMonster(currentMonster);
      }
      currentMonster = this.getNextMonsterTurn();
    }
    stunnedMonsters.forEach((monster) => {
      monster.removeAllDebuff(Ability.STUN);
    });
  }

  private doGamePreRound(): void {
    // Add pre round things.
  }

  private doPostRound() {
    let aliveTeam1 = this.team1.getAliveMonsters();
    let aliveTeam2 = this.team2.getAliveMonsters();

    if (this.rulesets.has(Ruleset.EARTHQUAKE)) {
      this.doPostRoundEarthquake(aliveTeam1);
      this.doPostRoundEarthquake(aliveTeam2);
      aliveTeam1 = this.team1.getAliveMonsters();
      aliveTeam2 = this.team2.getAliveMonsters();
    }

    this.monstersOnPostRound(aliveTeam1);
    this.monstersOnPostRound(aliveTeam2);
  }

  private doPostRoundEarthquake(aliveMonsters: GameMonster[]) {
    for (const monster of aliveMonsters) {
      const battleDamage = rulesetUtils.applyEarthquake(monster);
      this.createAndAddBattleLog(
        AdditionalBattleAction.EARTHQUAKE,
        monster,
        undefined,
        battleDamage.damageDone,
      );

      this.maybeDead(monster);
      this.checkAndSetGameWinner();
      if (this.winner !== undefined) {
        return;
      }
    }
  }

  private monstersOnPostRound(aliveMonsters: GameMonster[]) {
    for (const monster of aliveMonsters) {
      if (monster.hasDebuff(Ability.POISON)) {
        monster.health = monster.health - abilityUtils.POISON_DAMAGE;
        this.maybeDead(monster);
        this.createAndAddBattleLog(Ability.POISON, monster, undefined, abilityUtils.POISON_DAMAGE);
      }
      monster.setHasTurnPassed(false);
    }
  }

  private getNextMonsterTurn(): GameMonster | null {
    const allUnmovedMonsters = this.team1
      .getUnmovedMonsters()
      .concat(this.team2.getUnmovedMonsters());
    if (allUnmovedMonsters.length === 0) {
      return null;
    }

    allUnmovedMonsters.sort(gameUtils.monsterTurnComparator);
    return this.rulesets.has(Ruleset.REVERSE_SPEED)
      ? allUnmovedMonsters[0]
      : allUnmovedMonsters[allUnmovedMonsters.length - 1];
  }

  private applyAbilityToMonsters(monsters: GameMonster[], ability: Ability) {
    for (const monster of monsters) {
      monster.addAbility(ability);
    }
  }

  private addMonsterToMonsterDebuff(
    monsterThatApplied: GameMonster,
    monsterAffected: GameMonster,
    debuff: Ability,
  ) {
    monsterAffected.addDebuff(debuff);
    this.createAndAddBattleLog(debuff, monsterThatApplied, monsterAffected);
  }

  private applyDebuffToMonsters(monsters: GameMonster[], debuff: Ability) {
    for (const monster of monsters) {
      monster.addDebuff(debuff);
    }
  }

  private applyBuffToMonsters(monsters: GameMonster[], buff: Ability) {
    for (const monster of monsters) {
      monster.addBuff(buff);
    }
  }

  // TODO: this hits all of team 1 then 2, but team order should random
  private fatigueMonsters(roundNumber: number) {
    const fatigueDamage = roundNumber - FATIGUE_ROUND_NUMBER + 1;
    const allAliveMonsters = this.team1.getAliveMonsters().concat(this.team2.getAliveMonsters());
    for (const monster of allAliveMonsters) {
      this.createAndAddBattleLog(AdditionalBattleAction.FATIGUE, monster, undefined, fatigueDamage);
      monster.hitHealth(fatigueDamage);
      this.maybeDead(monster);
    }
    this.checkAndSetGameWinner();
    if (this.winner !== undefined) {
      return;
    }
  }

  private getTeamOfMonster(monster: GameMonster): GameTeam {
    return monster.getTeamNumber() === 1 ? this.team1 : this.team2;
  }

  private getEnemyTeamOfMonster(monster: GameMonster): GameTeam {
    return monster.getTeamNumber() === 1 ? this.team2 : this.team1;
  }

  private createAndAddBattleLog(
    action: BattleLogAction,
    cardOne?: GameCard,
    cardTwo?: GameCard,
    value?: number,
  ) {
    if (!this.shouldLog) {
      return;
    }
    const actor = cardOne ? cardOne.clone() : undefined;
    const target = cardTwo ? cardTwo.clone() : undefined;
    const log = {
      actor,
      action,
      target,
      value,
    };
    this.battleLogs.push(log);
  }
}
