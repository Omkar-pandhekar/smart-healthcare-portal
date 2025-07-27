import React from "react";
import { cn } from "@/lib/utils";
import { Building2, MapPin, Phone, Mail, Globe } from "lucide-react";
import Image from "next/image";
import { RatingDisplay } from "@/components/ui/rating";

interface CardGridProps {
  title: string;
  subtitle?: string;
  image?: string;
  details?: {
    phone?: string;
    email?: string;
    website?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
    };
  };
  onClick?: () => void;
  className?: string;
  averageRating?: number;
  totalRatings?: number;
}

const CardGrid: React.FC<CardGridProps> = ({
  title,
  subtitle,
  image,
  details,
  onClick,
  className,
  averageRating,
  totalRatings,
}) => {
  return (
    <div
      className={cn(
        "border rounded-lg bg-white dark:bg-zinc-900 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer overflow-hidden",
        className
      )}
      onClick={onClick}
    >
      {/* Image Section */}
      <div className="relative h-48 bg-gray-100 dark:bg-gray-800">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            onError={(e) => {
              console.log("Image failed to load:", image);
              // Hide the image on error
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 line-clamp-1">
            {title}
          </h3>
          {averageRating && averageRating > 0 && (
            <RatingDisplay
              value={averageRating}
              totalRatings={totalRatings}
              size="sm"
              showCount={false}
            />
          )}
        </div>

        {subtitle && (
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm mb-3">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="line-clamp-2">{subtitle}</span>
          </div>
        )}

        <div className="space-y-2">
          {details?.phone && (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
              <Phone className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{details.phone}</span>
            </div>
          )}

          {details?.email && (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{details.email}</span>
            </div>
          )}

          {details?.website && (
            <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400 text-xs">
              <Globe className="w-3 h-3 flex-shrink-0" />
              <a
                href={details.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="truncate hover:underline"
              >
                {details.website}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardGrid;
