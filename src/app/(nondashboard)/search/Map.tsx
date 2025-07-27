"use client";
import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

const DEFAULT_CENTER: [number, number] = [77.209, 28.6139];

type MapProps = {
  center?: [number, number];
};

type Hospital = {
  name?: string;
  address?: {
    location?: {
      coordinates?: [number, number];
    };
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
};

const createHospitalMarker = (hospital: Hospital, map: mapboxgl.Map) => {
  const coords = hospital?.address?.location?.coordinates;
  if (!coords || (coords[0] === 0 && coords[1] === 0)) return null;
  const name = hospital.name || "Hospital";
  const addressParts = [
    hospital.address?.street,
    hospital.address?.city,
    hospital.address?.state,
    hospital.address?.country,
    hospital.address?.postalCode,
  ]
    .filter(Boolean)
    .join(", ");
  const popupHtml = `
    <div class="marker-popup">
      <div>
        <span class="marker-popup-title">${name}</span>
        <p class="marker-popup-address">${addressParts}</p>
      </div>
    </div>
  `;
  const marker = new mapboxgl.Marker()
    .setLngLat([coords[0], coords[1]])
    .setPopup(new mapboxgl.Popup().setHTML(popupHtml))
    .addTo(map);
  return marker;
};

const Map = ({ center }: MapProps) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  // Initialize map only once
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/omkar82080/cmde7noug002a01qy3qpie1ug",
      center: center || DEFAULT_CENTER,
      zoom: 10,
    });

    fetch("/api/hospital/get-list")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.hospitals)) {
          data.hospitals.forEach((hospital: Hospital) => {
            createHospitalMarker(hospital, mapRef.current!);
          });
        }
      });

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  // Move map when center changes
  useEffect(() => {
    if (mapRef.current && center) {
      mapRef.current.flyTo({ center, zoom: 10 });
    }
  }, [center]);

  return (
    <div className="basis-5/12 grow relative rounded-xl">
      <div
        className="map-container rounded-xl"
        ref={mapContainerRef}
        style={{
          height: "100%",
          width: "100%",
        }}
      />
    </div>
  );
};

export default Map;
