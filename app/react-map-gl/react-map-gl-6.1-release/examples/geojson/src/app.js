import * as React from 'react';
import {useState, useEffect, useMemo, useCallback} from 'react';
import {render} from 'react-dom';
import MapGL, {Source, Layer} from 'react-map-gl';
import ControlPanel from './control-panel';

import {dataLayer} from './map-style.js';
import {updatePercentiles} from './utils';

const MAPBOX_TOKEN = 'pk.eyJ1IjoibWliZXJsIiwiYSI6ImNrbnI0YnNmMDBsNWcydXF3end5bnJvMnYifQ.-iTvckAzIPYilCLo9G14sA'; // Set your mapbox token here

export default function App() {
  const [viewport, setViewport] = useState({
    latitude: 40,
    longitude: -100,
    zoom: 3,
    bearing: 0,
    pitch: 0
  });
  const [year, setYear] = useState(2015);
  const [allData, setAllData] = useState(null);
  const [hoverInfo, setHoverInfo] = useState(null);

  useEffect(() => {
    /* global fetch */
    fetch(
      //'https://raw.githubusercontent.com/uber/react-map-gl/master/examples/.data/us-income.geojson'
      'https://raw.githubusercontent.com/miberl/Analisi-PM10/main/app/react-map-gl/react-map-gl-6.1-release/examples/geojson/geojson.geojson?token=ALGT6QJ5YZ5X3BF4LNHLFWDASASIM'
    )
      .then(resp => resp.json())
      .then(json => setAllData(json));
  }, []);

  const onHover = useCallback(event => {
    const {
      features,
      srcEvent: {offsetX, offsetY}
    } = event;
    const hoveredFeature = features && features[0];

    setHoverInfo(
      hoveredFeature
        ? {
            feature: hoveredFeature,
            x: offsetX,
            y: offsetY
          }
        : null
    );
  }, []);

  const data = useMemo(() => {
    return allData && updatePercentiles(allData, f => f.properties.income[year]);
  }, [allData, year]);

  return (
    <>
      <MapGL
        {...viewport}
        width="100%"
        height="100%"
        mapStyle="mapbox://styles/mapbox/light-v9"
        onViewportChange={setViewport}
        mapboxApiAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={['data']}
        onHover={onHover}
      >
        <Source type="geojson" data={data}>
          <Layer {...dataLayer} />
        </Source>
        {hoverInfo && (
          <div className="tooltip" style={{left: hoverInfo.x, top: hoverInfo.y}}>
            <div>State: {hoverInfo.feature.properties.name}</div>
            <div>Median Household Income: {hoverInfo.feature.properties.value}</div>
            <div>Percentile: {(hoverInfo.feature.properties.percentile / 8) * 100}</div>
          </div>
        )}
      </MapGL>

      <ControlPanel year={year} onChange={value => setYear(value)} />
    </>
  );
}

export function renderToDom(container) {
  render(<App />, container);
}
