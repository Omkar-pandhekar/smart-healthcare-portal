"use client";

import React, { useState } from "react";
import HospitalFiltersBar from "./Filters";
import Map from "./Map";
import Listings from "./Listings";

const DEFAULT_CENTER: [number, number] = [77.209, 28.6139];

const SearchPage = () => {
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [selectedCity, setSelectedCity] = useState<string | undefined>(
    undefined
  );

  const handleLocationSearch = (
    location: string,
    coordinates: [number, number]
  ) => {
    setMapCenter(coordinates);
    setSelectedCity(location); // Save the searched city
  };

  return (
    <div
      className="w-full mx-auto px-5 flex flex-col pt-20"
      style={{
        height: `calc(100vh - 20px)`,
      }}
    >
      <HospitalFiltersBar onLocationSearch={handleLocationSearch} />
      <div className="flex flex-1 overflow-hidden gap-3 mb-5">
        <Map center={mapCenter} />
        <Listings city={selectedCity} />
      </div>
    </div>
  );
};

export default SearchPage;
