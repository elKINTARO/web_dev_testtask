"use client";

import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./style.module.css";
import { useEffect } from "react";
import L from "leaflet";

interface MapProps {
  fromPos: [number, number];
  toPos: [number, number];
  height?: number;
}

function FitBounds({ fromPos, toPos }: MapProps) {
  const map = useMap();

  useEffect(() => {
    const bounds = L.latLngBounds([fromPos, toPos]);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  }, [map, fromPos, toPos]);

  return null;
}

export default function Map({ fromPos, toPos, height = 550 }: MapProps) {
  const route: [number, number][] = [fromPos, toPos];

  useEffect(() => {
    delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
  }, []);

  return (
    <div className={styles.mapWrapper}>
      <MapContainer
        center={fromPos}
        zoom={13}
        style={{ height: `${height}px`, width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitBounds fromPos={fromPos} toPos={toPos} />
        <Polyline
          positions={route}
          pathOptions={{ color: "#3d4043", weight: 4, opacity: 0.8 }}
        />
        <Marker position={fromPos}>
          <Popup>Point A</Popup>
        </Marker>
        <Marker position={toPos}>
          <Popup>Point B</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}