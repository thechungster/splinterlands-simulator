/**
 * This file shows an example of how to use the simulator with a historic battle.
 */

import {
  BattleDetails,
  BattleHistory,
  BattleTeam,
  CardDetail,
  Ruleset,
  TEAM_NUMBER,
} from './simulator/types';
import { Game } from './simulator/game';
import { GameTeam } from './simulator/game_team';
import { GameSummoner } from './simulator/game_summoner';
import { GameMonster } from './simulator/game_monster';

const SPLINTERLANDS_API_URL = 'https://api2.splinterlands.com/';
const GET_ALL_CARDS_ENDPOINT = 'cards/get_details';
const BATTLE_HISTORY_ENDPOINT = 'battle/result?id=';

/** An example of a battle using a battle from Splinterlands history */
export async function exampleHistoricBattle() {
  const allCards = await getAllCards();
  const historicBattle = await getHistoricBattle('sm_u2ZVmBg4veJJLywjss56');
  const battleDetails = JSON.parse(historicBattle.details) as BattleDetails;
  const rulesets = historicBattle.ruleset.split('|');
  const rulesetSet: Set<Ruleset> = new Set();
  [(Ruleset as any)[rulesets[0]], (Ruleset as any)[rulesets[1]]]
    .filter((rule) => !!rule)
    .forEach((rule) => rulesetSet.add(rule));
  const game = createGame(allCards, battleDetails, rulesetSet);

  game.playGame();

  if (game.getWinner() === TEAM_NUMBER.UNKNOWN) {
    console.log('Tie!');
  } else if (game.getWinner() === TEAM_NUMBER.FRIENDLY) {
    console.log(`${battleDetails.team1.player} wins!`);
  } else {
    console.log(`${battleDetails.team2.player} wins!`);
  }
}

/** An example of a custom battle using cards and rules that you set */
export async function exampleCustomBattle() {
  const allCards = await getAllCards();
  const rules = new Set<Ruleset>();
  rules.add(Ruleset.NOXIOUS_FUMES);
  rules.add(Ruleset.EARTHQUAKE);
  const scarredLlamaMageCard = allCards[278 - 1];
  const kronCard = allCards[188 - 1];
  const fleshGolemCard = allCards[23 - 1];

  const kronGameMonster = new GameMonster(kronCard, /* cardLevel */ 2);
  const fleshGolemMonster = new GameMonster(fleshGolemCard, /* cardLevel */ 9);

  const team1 = new GameTeam(
    new GameSummoner(scarredLlamaMageCard, /* cardLevel */ 1),
    [kronGameMonster],
    TEAM_NUMBER.FRIENDLY
  );
  const team2 = new GameTeam(
    new GameSummoner(scarredLlamaMageCard, /* cardLevel */ 3),
    [fleshGolemMonster],
    TEAM_NUMBER.FRIENDLY
  );

  const game = new Game(team1, team2, rules);
  game.playGame();
}

// You should store the cards locally so this doesn't need to be called all the time.
async function getAllCards(): Promise<CardDetail[]> {
  return await fetch(SPLINTERLANDS_API_URL + GET_ALL_CARDS_ENDPOINT).then(
    (response) => response.json() as Promise<CardDetail[]>
  );
}

async function getHistoricBattle(battleId: string): Promise<BattleHistory> {
  return await fetch(
    SPLINTERLANDS_API_URL + BATTLE_HISTORY_ENDPOINT + battleId
  ).then((response) => response.json() as Promise<BattleHistory>);
}

function createGameTeam(
  allCards: CardDetail[],
  battleTeam: BattleTeam,
  teamNumber: TEAM_NUMBER
): GameTeam {
  const gameSummoner = new GameSummoner(
    allCards[battleTeam.summoner.card_detail_id - 1],
    battleTeam.summoner.level
  );
  const gameMonsters = battleTeam.monsters.map((monster) => {
    const monsterCard = allCards[monster.card_detail_id - 1];
    return new GameMonster(monsterCard, monster.level);
  });
  return new GameTeam(gameSummoner, gameMonsters, teamNumber);
}

function createGame(
  allCards: CardDetail[],
  battleDetails: BattleDetails,
  rulesets: Set<Ruleset>
): Game {
  const gameTeam1 = createGameTeam(
    allCards,
    battleDetails.team1,
    TEAM_NUMBER.FRIENDLY
  );
  const gameTeam2 = createGameTeam(
    allCards,
    battleDetails.team2,
    TEAM_NUMBER.ENEMY
  );

  return new Game(gameTeam1, gameTeam2, rulesets);
}
