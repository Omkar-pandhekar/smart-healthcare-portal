"use client";
import React from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

const FloatingChatbotButton = () => {
  return (
    <Link href="/chatbot">
      <button className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50">
        <MessageCircle className="h-6 w-6" />
      </button>
    </Link>
  );
};

export default FloatingChatbotButton;
