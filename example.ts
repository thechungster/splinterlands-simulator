/**
 * This file shows an example of how to use the simulator with a historic battle,
 * and an example using custom rules and cards.
 */

import { Ruleset } from './src/types';
import { BattleDetails, BattleHistory, BattleTeam, CardDetail } from 'splinterlands-types';
import { Game } from './src/game';
import { GameTeam } from './src/game_team';
import { GameSummoner } from './src/game_summoner';
import { GameMonster } from './src/game_monster';

const SPLINTERLANDS_API_URL = 'https://api2.splinterlands.com/';
const GET_ALL_CARDS_ENDPOINT = 'cards/get_details';
const BATTLE_HISTORY_ENDPOINT = 'battle/result?id=';

/** An example of a custom battle using cards and rules that you set.
 *  Creates the game using the card id. Returns the battle logs. */
function exampleCustomBattle() {
  const rules = new Set<Ruleset>();
  rules.add(Ruleset.NOXIOUS_FUMES);
  rules.add(Ruleset.EARTHQUAKE);
  const scarredLlamaMageId = 278;
  const kronCardId = 188;
  const fleshGolemCardId = 23;

  const kronGameMonster = new GameMonster(kronCardId, /* cardLevel */ 2);
  const fleshGolemMonster = new GameMonster(fleshGolemCardId, /* cardLevel */ 9);

  const team1 = new GameTeam(new GameSummoner(scarredLlamaMageId, /* cardLevel */ 1), [
    kronGameMonster,
  ]);
  const team2 = new GameTeam(new GameSummoner(scarredLlamaMageId, /* cardLevel */ 3), [
    fleshGolemMonster,
  ]);

  const game = new Game(team1, team2, rules, /* shouldLog */ true);
  game.playGame();
  return game.getWinner();
}

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
}

// In case the cards.json is not updated you can get all cards from the Splinterlands API
async function getAllCards(): Promise<CardDetail[]> {
  return await fetch(SPLINTERLANDS_API_URL + GET_ALL_CARDS_ENDPOINT).then(
    (response) => response.json() as Promise<CardDetail[]>,
  );
}

async function getHistoricBattle(battleId: string): Promise<BattleHistory> {
  return await fetch(SPLINTERLANDS_API_URL + BATTLE_HISTORY_ENDPOINT + battleId).then(
    (response) => response.json() as Promise<BattleHistory>,
  );
}

function createGameTeam(allCards: CardDetail[], battleTeam: BattleTeam): GameTeam {
  const gameSummoner = new GameSummoner(
    allCards[battleTeam.summoner.card_detail_id - 1],
    battleTeam.summoner.level,
  );
  const gameMonsters = battleTeam.monsters.map((monster) => {
    const monsterCard = allCards[monster.card_detail_id - 1];
    return new GameMonster(monsterCard, monster.level);
  });
  return new GameTeam(gameSummoner, gameMonsters);
}

function createGame(
  allCards: CardDetail[],
  battleDetails: BattleDetails,
  rulesets: Set<Ruleset>,
): Game {
  const gameTeam1 = createGameTeam(allCards, battleDetails.team1);
  const gameTeam2 = createGameTeam(allCards, battleDetails.team2);

  return new Game(gameTeam1, gameTeam2, rulesets);
}
