"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./style.module.css";
import { useLastURL } from "../[cash]/LastURL";
import { usePackageRoute } from "@/app/context/PackageRouteContext";

const Map = dynamic(() => import("../[components]/map/mape"), {
  ssr: false,
  loading: () => (
    <div className={styles.mapLoading}>Loading map...</div>
  ),
});

const DEFAULT_FROM: [number, number] = [28.5284, 78.5284];
const DEFAULT_TO: [number, number] = [35.9284, 62.9284];

function parseCoord(value: string): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function isValidCoord(coord: number): boolean {
  return Number.isFinite(coord);
}

export default function Place() {
  const router = useRouter();
  const { goToLastURL } = useLastURL();
  const { setRoute } = usePackageRoute();
  const [fromPos, setFromPos] = useState<[number, number]>(DEFAULT_FROM);
  const [toPos, setToPos] = useState<[number, number]>(DEFAULT_TO);

  const canSendBox =
    isValidCoord(fromPos[0]) &&
    isValidCoord(fromPos[1]) &&
    isValidCoord(toPos[0]) &&
    isValidCoord(toPos[1]);

  const handleSendBox = useCallback(() => {
    if (!canSendBox) return;
    setRoute(fromPos, toPos);
    router.push("/booking");
  }, [canSendBox, fromPos, toPos, setRoute, router]);

  const handleFromLat = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFromPos((prev) => [parseCoord(e.target.value), prev[1]]);
    },
    []
  );
  const handleFromLon = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFromPos((prev) => [prev[0], parseCoord(e.target.value)]);
    },
    []
  );
  const handleToLat = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setToPos((prev) => [parseCoord(e.target.value), prev[1]]);
    },
    []
  );
  const handleToLon = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setToPos((prev) => [prev[0], parseCoord(e.target.value)]);
    },
    []
  );

  return (
    <main className={styles.mainContainer}>
      <div className={styles.header}>
        <a onClick={goToLastURL} aria-label="Back">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M6.9375 13.5L13.5 21L10.5103 21L2.63527 12L10.5103 3L13.5 3L6.9375 10.5L21 10.5L21 13.5L6.9375 13.5Z" fill="black"/>
          </svg>
        </a>
        <h1>Plan your ride</h1>
      </div>

      <div className={styles.ridePlanner}>
        <div className={styles.inputGroup}>
          <span className={styles.label}>from</span>
          <div className={styles.inputWrapper}>
            <div className={styles.indicator}>
              <div className={styles.dot}></div>
              <div className={styles.line}></div>
              <div className={styles.square}></div>
            </div>
            <div className={styles.fields}>
              <input
                type="number"
                className={styles.input}
                value={fromPos[0]}
                onChange={handleFromLat}
                placeholder="lat"
                step="any"
              />
              <input
                type="number"
                className={styles.input}
                value={fromPos[1]}
                onChange={handleFromLon}
                placeholder="lon"
                step="any"
              />
            </div>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <span className={styles.label}>to</span>
          <div className={styles.inputWrapper}>
            <div className={styles.indicator}>
              <div className={styles.dot}></div>
              <div className={styles.line}></div>
              <div className={styles.square}></div>
            </div>
            <div className={styles.fields}>
              <input
                type="number"
                className={styles.input}
                value={toPos[0]}
                onChange={handleToLat}
                placeholder="lat"
                step="any"
              />
              <input
                type="number"
                className={styles.input}
                value={toPos[1]}
                onChange={handleToLon}
                placeholder="lon"
                step="any"
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.actionPlace}>
        <button
          type="button"
          onClick={handleSendBox}
          className={styles.Btn}
          disabled={!canSendBox}
        >
          Send Box
        </button>
      </div>

      <div className={styles.coordinatesMain}>
        <div className={styles.lovesCoordinates}>
            <button type="button" className={styles.a}>
                <div className={styles.lovesCoordinatesText}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <path d="M16 0C24.8366 0 32 7.16344 32 16C32 24.8366 24.8366 32 16 32C7.16344 32 0 24.8366 0 16C0 7.16344 7.16344 0 16 0ZM14.2021 13.3369L8.41602 13.873L12.7812 17.708L11.5039 23.377L16.5 20.4102L21.4961 23.377L20.2188 17.708L24.584 13.873L18.7979 13.3369L16.5 8L14.2021 13.3369Z" fill="#6B6B6B"/>
                    </svg>
                    <samp>Saved places</samp>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none">
                    <mask id="mask0_9_232"  maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                    <rect y="24" width="24" height="24" transform="rotate(-90 0 24)" fill="#D9D9D9"/>
                    </mask>
                    <g mask="url(#mask0_9_232)">
                    <path d="M12 13.4498L16.35 9.0998C16.6 8.8498 16.8917 8.72897 17.225 8.7373C17.5583 8.74564 17.85 8.8748 18.1 9.1248C18.35 9.3748 18.475 9.66647 18.475 9.9998C18.475 10.3331 18.35 10.6248 18.1 10.8748L13.425 15.5748C13.225 15.7748 13 15.9248 12.75 16.0248C12.5 16.1248 12.25 16.1748 12 16.1748C11.75 16.1748 11.5 16.1248 11.25 16.0248C11 15.9248 10.775 15.7748 10.575 15.5748L5.87499 10.8748C5.62499 10.6248 5.50415 10.329 5.51249 9.9873C5.52082 9.64564 5.64999 9.3498 5.89999 9.0998C6.14999 8.8498 6.44165 8.7248 6.77499 8.7248C7.10832 8.7248 7.39999 8.8498 7.64999 9.0998L12 13.4498Z" fill="#1C1B1F"/>
                    </g>
                </svg>
            </button>
        </div>
      </div>
      <div className={styles.mapBox}>
        <Map fromPos={fromPos} toPos={toPos} />
      </div>

    </main>
  );
}