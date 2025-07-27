import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const HospitalFiltersBar = ({
  onLocationSearch,
}: {
  onLocationSearch: (location: string, coordinates: [number, number]) => void;
}) => {
  const [searchInput, setSearchInput] = useState("");

  const handleLocationSearch = async () => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchInput
        )}.json?access_token=${
          process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
        }&fuzzyMatch=true`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        onLocationSearch(searchInput, [lng, lat]);
      }
    } catch (err) {
      console.error("Error searching location:", err);
    }
  };

  return (
    <div className="flex items-center p-4">
      <Input
        placeholder="Search city or area"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="w-60 rounded-l-xl rounded-r-none border-zinc-400 border-r-0"
      />
      <Button
        onClick={handleLocationSearch}
        className="rounded-r-xl rounded-l-none border-l-none border-zinc-400 shadow-none border hover:bg-zinc-700 hover:text-zinc-50"
      >
        <Search className="w-4 h-4" />
      </Button>
      {/* Add more hospital-specific filters here if needed */}
    </div>
  );
};

export default HospitalFiltersBar;
