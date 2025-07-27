"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { Button } from "./button";
import { Rating } from "./rating";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";

interface RatingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: "doctor" | "hospital";
  targetId: string;
  targetName: string;
  onRatingSubmitted?: () => void;
}

export const RatingDialog: React.FC<RatingDialogProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetName,
  onRatingSubmitted,
}) => {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && session?.user?.id) {
      fetchUserRating();
    }
  }, [isOpen, session?.user?.id]);

  const fetchUserRating = async () => {
    try {
      const response = await axios.get(`/api/ratings/get`, {
        params: {
          targetType,
          targetId,
          userId: session?.user?.id,
        },
      });

      if (response.data.success && response.data.userRating) {
        setUserRating(response.data.userRating.rating);
        setRating(response.data.userRating.rating);
        setReview(response.data.userRating.review || "");
      }
    } catch (error) {
      console.error("Error fetching user rating:", error);
    }
  };

  const handleSubmit = async () => {
    if (!session?.user?.id) {
      toast.error("Please login to rate");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/ratings/submit", {
        userId: session.user.id,
        targetType,
        targetId,
        rating,
        review: review.trim() || undefined,
      });

      if (response.data.success) {
        toast.success(
          userRating
            ? "Rating updated successfully!"
            : "Rating submitted successfully!"
        );
        onRatingSubmitted?.();
        onClose();
        setUserRating(rating);
      } else {
        toast.error(response.data.error || "Failed to submit rating");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Failed to submit rating");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Rate {targetType === "doctor" ? "Dr." : ""} {targetName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Your Rating
            </label>
            <Rating
              value={rating}
              onChange={(newRating) => setRating(newRating)}
              showReview={true}
              size="lg"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || rating === 0}
              className="flex-1"
            >
              {loading
                ? "Submitting..."
                : userRating
                ? "Update Rating"
                : "Submit Rating"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
