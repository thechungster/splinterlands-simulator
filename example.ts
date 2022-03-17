/**
 * This file shows an example of how to use the simulator.
 * Run using
 * tsc example.ts
 * node example.js
 */

import { CardDetail } from './simulator/types';

const SPLINTERLANDS_API_URL = 'https://api2.splinterlands.com/';
const GET_ALL_CARDS_ENDPOINT = 'cards/get_details';

async function getAllCards(): Promise<CardDetail[]> {
  return await fetch(SPLINTERLANDS_API_URL + GET_ALL_CARDS_ENDPOINT).then(
    (response) => response.json()
  );
}

async function exampleBattle() {
  const allCards = await getAllCards();
  console.log(allCards);
}

exampleBattle();
