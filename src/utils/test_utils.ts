import { CardColor, CardDetail, CardStats, CardType } from '../types';

export function createFakeCardDetail(cardStat: CardStats): CardDetail {
  return {
    id: 9999,
    color: CardColor.BLACK,
    type: CardType.MONSTER,
    rarity: 1,
    is_starter: false,
    editions: '1',
    stats: cardStat,
  } as CardDetail;
}
