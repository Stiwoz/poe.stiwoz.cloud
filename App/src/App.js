import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import './styles.css';

import { REAL_CARD_RATE, PINNED_DPI } from './consts/data';
import getCalculatedCards from './func/getCalculatedCards';
import getHeaderHtml from './func/getHeaderHtml';
import getFooterHtml from './func/getFooterHtml';

const inputMapsChanged = (e, setTargetAreas) => {
  const newMaps = e.target.value.split('\n');
  setTargetAreas(newMaps);
};

const printDataToHtml = (
  targetAreas,
  setTargetAreas,
  mapTotalWeight,
  dropPoolItems,
  totalRawEV,
  totalStackScarabEV,
  sortedCards,
  allMapVals,
  league
) => {
  const priceLabel =
    league.toLowerCase() === 'standard' ? 'standardPrice' : 'price';
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', overflowX: 'scroll' }}
    >
      {getHeaderHtml()}
      <h3>INPUTS</h3>
      <h5>chosen maps:</h5>
      <textarea
        rows={targetAreas.length}
        value={targetAreas.join('\n')}
        onChange={(e) => inputMapsChanged(e, setTargetAreas)}
      ></textarea>
      <br />
      <h5>total map weight: {mapTotalWeight}</h5>
      <h5>
        Pinned drop count: {REAL_CARD_RATE.name} {REAL_CARD_RATE.number}
      </h5>
      <h5>Pinned drop pool item: {PINNED_DPI}</h5>
      <h5>drop pool items: {dropPoolItems}</h5>
      <h5>
        totalEV: {totalRawEV.toFixed(2)} | totalStackScarabEV:{' '}
        {totalStackScarabEV.toFixed(2)}
      </h5>
      <br />
      <h3>SINGLE CARD EVS</h3>
      <div style={{ display: 'flex' }}>
        <div style={{ minWidth: '250px' }}>
          <h5>Name</h5>
        </div>
        <div style={{ minWidth: '100px' }}>
          <h5>Price (c)</h5>
        </div>
        <div style={{ minWidth: '75px' }}>
          <h5>EV</h5>
        </div>
        <div style={{ minWidth: '75px' }}>
          <h5>SSEV</h5>
        </div>
        <div style={{ minWidth: '100px' }}>
          <h5>Drops per map</h5>
        </div>
        <div style={{ minWidth: '100px' }}>
          <h5>SS Drops per map</h5>
        </div>
        <div style={{ minWidth: '150px' }}>
          <h5>Raw Weight</h5>
        </div>
      </div>
      {sortedCards.map((c, idx) => (
        <div
          key={idx}
          style={{ display: 'flex' }}
          disabled={c.reward == 'Disabled'}
        >
          <div style={{ minWidth: '250px' }}>
            <a href={c.ninja} target='_blank' title={c.reward}>
              {c.name} ({c.stack})
            </a>
          </div>
          <div style={{ minWidth: '100px' }}>{c[priceLabel]}</div>
          <div style={{ minWidth: '75px' }}>{c.rawEV.toFixed(2)}</div>
          <div style={{ minWidth: '75px' }}>{c.stackScarabEV.toFixed(2)}</div>
          <div style={{ minWidth: '100px' }}>{c.rawDrops.toFixed(2)}</div>
          <div style={{ minWidth: '100px' }}>
            {c.stackScarabDrops.toFixed(2)}
          </div>
          <div style={{ minWidth: '150px' }}>{c.weight}</div>
        </div>
      ))}
      <br />
      <h3>MAP EVS</h3>
      <div style={{ display: 'flex' }}>
        <div style={{ minWidth: '200px' }}>
          <h5>Map name</h5>
        </div>
        <div style={{ minWidth: '150px' }}>
          <h5>Raw total EV</h5>
        </div>
        <div style={{ minWidth: '150px' }}>
          <h5>Stack Scarab total EV</h5>
        </div>
        <div style={{ minWidth: '150px' }}>
          <h5>Predicted raw total EV</h5>
        </div>
        <div style={{ minWidth: '150px' }}>
          <h5>Predicted ss total EV</h5>
        </div>
      </div>
      {allMapVals.map((m, idx) => {
        const { name, res, predicted } = m;
        return (
          <div key={idx} style={{ display: 'flex' }}>
            <div style={{ minWidth: '200px' }}>{name}</div>
            <div style={{ minWidth: '150px' }}>{res.totalRawEV.toFixed(2)}</div>
            <div style={{ minWidth: '150px' }}>
              {res.totalStackScarabEV.toFixed(2)}
            </div>
            <div style={{ minWidth: '150px' }}>
              {predicted.totalRawEV.toFixed(2)}
            </div>
            <div style={{ minWidth: '150px' }}>
              {predicted.totalStackScarabEV.toFixed(2)}
            </div>
          </div>
        );
      })}
      {getFooterHtml()}
    </div>
  );
};

export function League({ allCards, allMaps, setTargetAreas, targetAreas }) {
  useEffect(() => {
    async function getTargetAreas() {
      const response = await fetch(
        'https://poe.stiwoz.cloud/api/league_maps.json'
      );
      const data = await response.json();
      setTargetAreas(data);
    }

    if (!targetAreas.length) {
      getTargetAreas();
    }
  }, []);

  if (!targetAreas.length) return <div>Loading...</div>;

  const {
    mapTotalWeight,
    dropPoolItems,
    cards: rawCards,
    totalRawEV,
    totalStackScarabEV,
  } = getCalculatedCards(targetAreas, allCards, 'league');
  const sortedCards = rawCards.sort((a, b) => b.rawEV - a.rawEV);
  const allMapVals = allMaps
    .map((map) => ({
      name: map,
      res: getCalculatedCards([map], allCards, 'league'),
      predicted: getCalculatedCards([...targetAreas, map], allCards, 'league'),
    }))
    .sort((a, b) => b.predicted.totalRawEV - a.predicted.totalRawEV);

  return printDataToHtml(
    targetAreas,
    setTargetAreas,
    mapTotalWeight,
    dropPoolItems,
    totalRawEV,
    totalStackScarabEV,
    sortedCards,
    allMapVals,
    'league'
  );
}

export function Standard({ allCards, allMaps, setTargetAreas, targetAreas }) {
  useEffect(() => {
    async function getTargetAreas() {
      const response = await fetch(
        'https://poe.stiwoz.cloud/api/std_maps.json'
      );
      const data = await response.json();
      setTargetAreas(data);
    }

    if (!targetAreas.length) {
      getTargetAreas();
    }
  }, []);

  if (!targetAreas.length) return <div>Loading...</div>;

  const {
    mapTotalWeight,
    dropPoolItems,
    cards: rawCards,
    totalRawEV,
    totalStackScarabEV,
  } = getCalculatedCards(targetAreas, allCards, 'standard');
  const sortedCards = rawCards
    .sort((a, b) => b.rawEV - a.rawEV)
    .map((c) => ({
      ...c,
      ninja: c.ninja.replace('challenge', 'standard'),
    }));
  const allMapVals = allMaps
    .map((map) => ({
      name: map,
      res: getCalculatedCards([map], allCards, 'standard'),
      predicted: getCalculatedCards(
        [...targetAreas, map],
        allCards,
        'standard'
      ),
    }))
    .sort((a, b) => b.predicted.totalRawEV - a.predicted.totalRawEV);

  return printDataToHtml(
    targetAreas,
    setTargetAreas,
    mapTotalWeight,
    dropPoolItems,
    totalRawEV,
    totalStackScarabEV,
    sortedCards,
    allMapVals,
    'standard'
  );
}

export default function App() {
  const [allCards, setAllCards] = useState([]);
  const [allMaps, setAllMaps] = useState([]);
  const [targetAreas, setTargetAreas] = useState([]);
  useEffect(() => {
    async function getAllCards() {
      const response = await fetch('https://poe.stiwoz.cloud/api/cards.json');
      const data = await response.json();
      setAllCards(data);
    }

    if (!allCards.length) {
      getAllCards();
    }

    async function getAllMaps() {
      const response = await fetch('https://poe.stiwoz.cloud/api/maps.json');
      const data = await response.json();
      setAllMaps(data);
    }

    if (!allMaps.length) {
      getAllMaps();
    }
  }, []);

  if (!allCards.length || !allMaps.length) return <div>Loading...</div>;

  return (
    <Routes>
      <Route
        index
        path='league'
        element={
          <League
            allCards={allCards}
            allMaps={allMaps}
            targetAreas={targetAreas}
            setTargetAreas={setTargetAreas}
          />
        }
      />
      <Route
        path='standard'
        element={
          <Standard
            allCards={allCards}
            allMaps={allMaps}
            targetAreas={targetAreas}
            setTargetAreas={setTargetAreas}
          />
        }
      />
      <Route path='*' element={<Navigate to='/league' />} />
    </Routes>
  );
}
