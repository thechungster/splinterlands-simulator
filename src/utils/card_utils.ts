import * as cards from '../cards.json';
import { CardDetail } from '../types';

export function getCardDetailFromId(cardDetailId: number): CardDetail {
  if (cardDetailId > cards.length) {
    throw new Error(`Could not find card id of ${cardDetailId}`);
  }
  return cards[cardDetailId - 1] as unknown as CardDetail;
}
