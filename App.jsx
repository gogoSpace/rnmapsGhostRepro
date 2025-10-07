import React, { useRef, useState, useCallback } from 'react';
import { View, Button } from 'react-native'; // +colors for clusters via props
import MapClustering from 'react-native-map-clustering';
import { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const CENTER = { lat: 49.931305, lng: 17.531996 };
const SPAN = { lat: 4, lng: 4 };

const make = (n, seed = Date.now()) => {
  const pts = Array.from({ length: n }, (_, i) => ({
    id: `p${seed}-${i}`,
    lat: CENTER.lat + (Math.random() - 0.5) * SPAN.lat,
    lng: CENTER.lng + (Math.random() - 0.5) * SPAN.lng,
  }));
  const c = centerOf(pts);
  const dLat = CENTER.lat - c.lat;
  const dLng = CENTER.lng - c.lng;
  return pts.map(p => ({ ...p, lat: p.lat + dLat, lng: p.lng + dLng }));
};

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randMs = (min = 20, max = 300) => randInt(min, max);
const sleep = ms => new Promise(r => setTimeout(r, ms));

const centerOf = pts => {
  if (!pts?.length) return { lat: 0, lng: 0 };
  let minLat = 90,
    maxLat = -90,
    minLng = 180,
    maxLng = -180;
  for (const p of pts) {
    minLat = Math.min(minLat, p.lat);
    maxLat = Math.max(maxLat, p.lat);
    minLng = Math.min(minLng, p.lng);
    maxLng = Math.max(maxLng, p.lng);
  }
  return { lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2 };
};

const panByPixels = async (mapRef, pxX, pxY) => {
  const cam = await mapRef.current?.getCamera?.();
  if (!cam) return;
  const degPerPx = 360 / (256 * Math.pow(2, cam.zoom));
  const latRad = (cam.center.latitude * Math.PI) / 180;
  const dLon = (pxX * degPerPx) / Math.max(Math.cos(latRad), 1e-6);
  const dLat = -pxY * degPerPx;
  await mapRef.current?.setCamera?.({
    center: {
      latitude: cam.center.latitude + dLat,
      longitude: cam.center.longitude + dLon,
    },
  });
};

// === Colors via official props ===
// Marker.pinColor (react-native-maps) + MapClustering.clusterColor/clusterTextColor
const randomHue = () => Math.floor(Math.random() * 360);
const hslToRgb = (h, s = 80, l = 50) => {
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [
    Math.round(255 * f(0)),
    Math.round(255 * f(8)),
    Math.round(255 * f(4)),
  ];
};
const toHex = ([r, g, b]) =>
  '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
const textColorFor = ([r, g, b]) =>
  (r * 299 + g * 587 + b * 114) / 1000 > 140 ? '#000' : '#fff';

export default function ExcessiveZoomingTest() {
  const mapRef = useRef(null);
  const [items, setItems] = useState(() => make(1000, 1));
  const [clusterOn, setClusterOn] = useState(true);
  const [h, setH] = useState(() => randomHue());
  const rgb = hslToRgb(h);
  const hex = toHex(rgb);
  const txt = textColorFor(rgb);

  const shuffle = useCallback(n => {
    setItems(make(n, Math.floor(Math.random() * 1e6)));
    setH(randomHue());
  }, []);

  const zoomTest = useCallback(
    async (cycles = 8) => {
      if (!mapRef.current) return;

      const c = centerOf(items);

      await mapRef.current.animateCamera(
        { center: { latitude: c.lat, longitude: c.lng }, zoom: 6 },
        { duration: 300 },
      );
      await sleep(randMs());

      for (let i = 15; i > 5; i--) {
        await mapRef.current.animateCamera(
          { center: { latitude: c.lat, longitude: c.lng }, zoom: i },
          { duration: 250 },
        );

        await sleep(250);
        await panByPixels(mapRef, randInt(-10, 10), randInt(-10, 10));
        await sleep(250);
      }

      for (let i = 0; i < cycles; i++) {
        const zin = randInt(9, 12);
        await mapRef.current.animateCamera(
          { zoom: zin },
          { duration: randInt(150, 300) },
        );
        await sleep(randMs());
        await panByPixels(mapRef, randInt(-10, 10), randInt(-10, 10));
        await sleep(randMs());

        const zout = randInt(5, 8);
        await mapRef.current.animateCamera(
          { zoom: zout },
          { duration: randInt(150, 300) },
        );
        await sleep(randMs());
      }

      await mapRef.current.animateCamera(
        { center: { latitude: c.lat, longitude: c.lng }, zoom: 6 },
        { duration: 500 },
      );
    },
    [items],
  );

  return (
    <View style={{ flex: 1 }}>
      <MapClustering
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        clusteringEnabled={clusterOn}
        radius={50}
        extent={512}
        clusterColor={hex}
        clusterTextColor={txt}
        initialRegion={{
          latitude: CENTER.lat,
          longitude: CENTER.lng,
          latitudeDelta: SPAN.lat,
          longitudeDelta: SPAN.lng,
        }}
      >
        {items.map(p => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.lat, longitude: p.lng }}
            tracksViewChanges={false}
            pinColor={hex}
          />
        ))}
      </MapClustering>

      <View
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          gap: 5,
        }}
      >
        <Button
          title="Run Excessive Zooming Test"
          onPress={() => zoomTest(5)}
        />
        <Button title="Regenerate 1k markers" onPress={() => shuffle(1000)} />
        <Button title="Toggle Cluster" onPress={() => setClusterOn(v => !v)} />
      </View>
    </View>
  );
}
