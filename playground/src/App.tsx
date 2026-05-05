import {
  GpxTrackLayer,
  LeafletMap,
  MapTileLayer,
  MarkerLayer,
  PolylineLayer,
  parseGpx,
} from 'react-mapy';
import { createMapyProvider } from 'react-mapy/providers/mapy';

const center = { lat: 50.0755, lng: 14.4378 };
const route = [
  { lat: 50.0784, lng: 14.4208 },
  { lat: 50.081, lng: 14.4285 },
  { lat: 50.0781, lng: 14.4367 },
  { lat: 50.0738, lng: 14.4439 },
] as const;
const sampleGpx = parseGpx(`<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="react-mapy playground">
  <trk>
    <name>Prague tempo loop</name>
    <trkseg>
      <trkpt lat="50.0784" lon="14.4208"><ele>190</ele><time>2026-03-26T07:00:00Z</time></trkpt>
      <trkpt lat="50.0798" lon="14.4255"><ele>192</ele><time>2026-03-26T07:02:25Z</time></trkpt>
      <trkpt lat="50.0782" lon="14.4311"><ele>194</ele><time>2026-03-26T07:05:05Z</time></trkpt>
      <trkpt lat="50.0759" lon="14.4381"><ele>196</ele><time>2026-03-26T07:08:10Z</time></trkpt>
      <trkpt lat="50.0736" lon="14.4444"><ele>194</ele><time>2026-03-26T07:11:45Z</time></trkpt>
    </trkseg>
  </trk>
</gpx>`);
const requiredTrack = sampleGpx.tracks[0];

if (!requiredTrack) {
  throw new Error('Expected the playground GPX sample to include a track.');
}

const sampleTrack = requiredTrack;

export default function App() {
  const apiKey = import.meta.env.VITE_MAPY_API_KEY as string | undefined;
  const provider = apiKey ? createMapyProvider({ apiKey, variant: 'outdoor' }) : undefined;

  return (
    <main
      style={{
        background:
          'radial-gradient(circle at top, rgba(15, 118, 110, 0.15), transparent 32%), #f8fafc',
        color: '#0f172a',
        minHeight: '100vh',
        padding: '32px',
      }}
    >
      <div
        style={{
          margin: '0 auto',
          maxWidth: '1100px',
        }}
      >
        <header style={{ marginBottom: '20px' }}>
          <p
            style={{
              color: '#0f766e',
              fontSize: '0.875rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              margin: 0,
              textTransform: 'uppercase',
            }}
          >
            react-mapy
          </p>
          <h1 style={{ fontSize: '2.5rem', margin: '8px 0 12px' }}>
            Leaflet + Mapy.com playground
          </h1>
          <p style={{ color: '#334155', margin: 0, maxWidth: '60ch' }}>
            The playground focuses on the public API. Add `VITE_MAPY_API_KEY` to preview live
            Mapy.com tiles, or use the overlay-only view to iterate on GPX rendering and layer
            composition.
          </p>
        </header>

        {!provider ? (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.92)',
              border: '1px solid rgba(15, 23, 42, 0.08)',
              borderRadius: '16px',
              marginBottom: '16px',
              padding: '12px 16px',
            }}
          >
            Set `VITE_MAPY_API_KEY` in your shell to enable live Mapy.com tiles in the playground.
          </div>
        ) : null}

        <LeafletMap
          center={center}
          style={{
            border: '1px solid rgba(15, 23, 42, 0.08)',
            borderRadius: '24px',
            boxShadow: '0 24px 80px rgba(15, 23, 42, 0.12)',
            height: '640px',
            overflow: 'hidden',
          }}
          zoom={13}
        >
          {provider ? <MapTileLayer provider={provider} /> : null}
          <MarkerLayer popupText="Old Town Square" position={center} tooltipText="Praha" />
          <PolylineLayer
            coordinates={route}
            pathOptions={{
              color: '#0f766e',
              dashArray: '10 8',
              opacity: 0.8,
              weight: 3,
            }}
          />
          <GpxTrackLayer
            fallbackColor="#1e293b"
            pathOptions={{
              opacity: 0.9,
            }}
            track={sampleTrack}
            weight={6}
          />
        </LeafletMap>
      </div>
    </main>
  );
}
