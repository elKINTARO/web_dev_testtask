"use client";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./style.module.css";
import { useState, useEffect } from "react";
import L from "leaflet";

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

export default function Map() {
  const [fromPos, setFromPos] = useState<[number, number]>([28.5284, 78.5284]);
  const [toPos, setToPos] = useState<[number, number]>([35.9284, 62.9284]);

  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  return (
    <div className={styles.mapWrapper}>
      <MapContainer 
        center={fromPos} 
        zoom={13} 
        style={{ height: "550px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <ChangeView center={fromPos} />
            <Marker position={fromPos}><Popup>Start</Popup></Marker>
            <Marker position={toPos}><Popup>End</Popup></Marker>
      </MapContainer>
    </div>
  );
}