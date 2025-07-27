import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CardCompact from "@/components/common/CardCompact";
import CardGrid from "@/components/common/CardGrid";
import { Building2, List, Grid3X3 } from "lucide-react";

// Hospital type
interface Hospital {
  _id?: string;
  name?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  phone?: string;
  email?: string;
  website?: string;
  images?: string[];
  averageRating?: number;
  totalRatings?: number;
}

type ViewMode = "list" | "grid";

interface ListingsProps {
  city?: string;
}

const Listings: React.FC<ListingsProps> = ({ city }) => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    fetch("/api/hospital/get-list")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.hospitals)) {
          setHospitals(data.hospitals);
        } else {
          setError(data.error || "Failed to fetch hospitals");
        }
      })
      .catch(() => setError("Failed to fetch hospitals"))
      .finally(() => setLoading(false));
  }, []);

  const formatAddress = (address?: Hospital["address"]) => {
    if (!address) return "";
    return [
      address.street,
      address.city,
      address.state,
      address.country,
      address.postalCode,
    ]
      .filter(Boolean)
      .join(", ");
  };

  const getFirstImage = (images?: string[]) => {
    if (!images || images.length === 0) {
      return undefined;
    }
    return images[0];
  };

  // Filter hospitals by city if city is provided
  const filteredHospitals = city
    ? hospitals.filter(
        (h) =>
          h.address?.city && h.address.city.toLowerCase() === city.toLowerCase()
      )
    : hospitals;

  if (loading) {
    return (
      <div className="w-full basis-4/12">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-pulse" />
            <p className="text-gray-500">Loading hospitals...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full basis-4/12">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full basis-4/12">
      {/* Header with View Mode Toggle */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {filteredHospitals.length}{" "}
            <span className="text-gray-600 dark:text-gray-400 font-normal">
              Hospitals found
            </span>
          </h3>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded-md transition-colors",
                viewMode === "list"
                  ? "bg-white dark:bg-gray-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              )}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded-md transition-colors",
                viewMode === "grid"
                  ? "bg-white dark:bg-gray-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              )}
              title="Grid view"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className={cn(
          "p-4 w-full max-h-[calc(100vh-200px)] overflow-y-auto",
          viewMode === "grid" ? "grid grid-cols-1 gap-4" : "flex flex-col gap-3"
        )}
      >
        {filteredHospitals.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No hospitals found</p>
          </div>
        ) : (
          filteredHospitals.map((hospital) => {
            const hospitalData = {
              title: hospital.name || "Unnamed Hospital",
              subtitle: formatAddress(hospital.address),
              image: getFirstImage(hospital.images),
              details: {
                phone: hospital.phone,
                email: hospital.email,
                website: hospital.website,
                address: hospital.address,
              },
              averageRating: hospital.averageRating,
              totalRatings: hospital.totalRatings,
              onClick: () =>
                hospital._id && router.push(`/search/${hospital._id}`),
            };

            return viewMode === "list" ? (
              <CardCompact
                key={hospital._id}
                {...hospitalData}
                className="hover:border-blue-300 dark:hover:border-blue-600"
              />
            ) : (
              <CardGrid
                key={hospital._id}
                {...hospitalData}
                className="hover:border-blue-300 dark:hover:border-blue-600"
              />
            );
          })
        )}
      </div>
    </div>
  );
};

// Helper function for className concatenation
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export default Listings;
