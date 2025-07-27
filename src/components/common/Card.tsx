import React from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  shadow?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  onClick,
  hover = true,
  shadow = true,
}) => {
  return (
    <div
      className={cn(
        "border rounded-lg p-4 bg-white dark:bg-zinc-900 transition-all duration-200",
        shadow && "shadow-sm",
        hover && "hover:shadow-md hover:scale-[1.02]",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
