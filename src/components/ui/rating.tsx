"use client";

import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Button } from "./button";
import { Textarea } from "./textarea";

interface RatingProps {
  value?: number;
  onChange?: (rating: number, review?: string) => void;
  readonly?: boolean;
  showReview?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Rating: React.FC<RatingProps> = ({
  value = 0,
  onChange,
  readonly = false,
  showReview = false,
  size = "md",
  className = "",
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleStarClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating, review);
    }
  };

  const handleStarHover = (rating: number) => {
    if (!readonly) {
      setHoverRating(rating);
    }
  };

  const handleStarLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || value;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
            onMouseLeave={handleStarLeave}
            disabled={readonly}
            className={`transition-colors ${
              readonly ? "cursor-default" : "cursor-pointer"
            }`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                star <= displayRating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
        {!readonly && (
          <span className="ml-2 text-sm text-gray-600">
            {displayRating > 0 ? `${displayRating}/5` : "Rate this"}
          </span>
        )}
      </div>

      {showReview && !readonly && (
        <div className="space-y-2">
          <Textarea
            placeholder="Write a review (optional)..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="min-h-[80px]"
            maxLength={500}
          />
          <div className="text-xs text-gray-500 text-right">
            {review.length}/500
          </div>
        </div>
      )}

      {showReview && readonly && review && (
        <div className="mt-2 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-700">{review}</p>
        </div>
      )}
    </div>
  );
};

// Display-only rating component
export const RatingDisplay: React.FC<{
  value: number;
  totalRatings?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
}> = ({
  value,
  totalRatings,
  size = "md",
  showCount = true,
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= value
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
      <div className="flex items-center gap-1 text-sm text-gray-600">
        <span className="font-medium">{value.toFixed(1)}</span>
        {showCount && totalRatings && (
          <span>
            ({totalRatings} {totalRatings === 1 ? "rating" : "ratings"})
          </span>
        )}
      </div>
    </div>
  );
};
