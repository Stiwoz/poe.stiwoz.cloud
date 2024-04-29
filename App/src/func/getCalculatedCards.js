import calculateCardEV from './calculateCardEV';
import isCardInArea from './isCardInArea';
import {
    CARD_PRICE_FLOOR_FILTER,
    CARD_WEIGHT_FLOOR_FILTER,
    FORCE_REMOVE_FILTER,
    FORCE_REMOVE_V_FILTER,
    FORCE_SHOW_FILTER,
    GLOBAL_DROP_RATE,
    PINNED_DPI,
    REAL_CARD_RATE,
    USE_FORCE_REMOVE_FILTER,
    USE_FORCE_SHOW_FILTER,
} from '../consts/data';

export default function getCalculatedCards(areas, allCards) {
  let totalRawEV = 0;
  let totalStackScarabEV = 0;

  // filter down to cards in map
  const mapCards = allCards.filter((card) => isCardInArea(card, areas));

  // calculate drop pool items
  const mapTotalWeight = mapCards.reduce(
    (acc, card) => acc + (card.weight ?? 0),
    0
  );
  const cardWeightBaseline = allCards.find(
    (card) => card.name === REAL_CARD_RATE.name
  ).weight;
  const currentTotalWeight = mapTotalWeight + GLOBAL_DROP_RATE;
  const dropPoolItems =
    (1 / (cardWeightBaseline / currentTotalWeight)) * REAL_CARD_RATE.number;
  const dpiMultiplier = (PINNED_DPI ?? dropPoolItems) / dropPoolItems;

  // filter all cards based on various conditions
  const filteredCards = mapCards.filter(
    (card) =>
      (card.price >= CARD_PRICE_FLOOR_FILTER &&
        !FORCE_REMOVE_V_FILTER.has(card.name) &&
        (!FORCE_REMOVE_FILTER.has(card.name) || !USE_FORCE_REMOVE_FILTER) &&
        card.weight !== undefined &&
        card.weight > CARD_WEIGHT_FLOOR_FILTER) ||
      (FORCE_SHOW_FILTER.has(card.name) && USE_FORCE_SHOW_FILTER)
  );

  const res = filteredCards.map((card) => {
    // calculate individual card drop rate
    const individualDropRate =
      (card.weight / currentTotalWeight) * dropPoolItems;
    const dropsPerMap = individualDropRate * dpiMultiplier;
    // calculate EVs
    const rawEV = calculateCardEV(card.stack, dropsPerMap, card.price, false);
    totalRawEV += rawEV.ev;
    const ssEV = calculateCardEV(card.stack, dropsPerMap, card.price, true);
    totalStackScarabEV += ssEV.ev;
    return {
      ...card,
      rawDrops: rawEV.drops,
      stackScarabDrops: ssEV.drops,
      rawEV: rawEV.ev,
      stackScarabEV: ssEV.ev,
    };
  });

  return {
    mapTotalWeight,
    dropPoolItems,
    totalRawEV,
    totalStackScarabEV,
    cards: res,
  };
}