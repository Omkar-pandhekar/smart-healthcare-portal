import React from "react";
import { cn } from "@/lib/utils";
import { Building2, MapPin, Phone, Mail, Globe } from "lucide-react";
import Image from "next/image";

interface CardCompactProps {
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
  showIcon?: boolean;
}

const CardCompact: React.FC<CardCompactProps> = ({
  title,
  subtitle,
  image,
  details,
  onClick,
  className,
  showIcon = true,
}) => {
  return (
    <div
      className={cn(
        "border rounded-lg p-4 bg-white dark:bg-zinc-900 transition-all duration-200 hover:shadow-md hover:scale-[1.01] cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {image ? (
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={image}
              alt={title}
              width={64}
              height={64}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.log("Image failed to load:", image);
                // Hide the image on error
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          </div>
        ) : showIcon ? (
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
        ) : null}

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-1">
            {title}
          </h3>

          {subtitle && (
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm mb-2">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{subtitle}</span>
            </div>
          )}

          <div className="space-y-1">
            {details?.phone && (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
                <Phone className="w-3 h-3" />
                <span>{details.phone}</span>
              </div>
            )}

            {details?.email && (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
                <Mail className="w-3 h-3" />
                <span className="truncate">{details.email}</span>
              </div>
            )}

            {details?.website && (
              <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400 text-xs">
                <Globe className="w-3 h-3" />
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
    </div>
  );
};

export default CardCompact;
