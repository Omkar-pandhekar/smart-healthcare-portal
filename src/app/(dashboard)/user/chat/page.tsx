"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Mic,
  MicOff,
  Volume2,
  Settings,
  Menu,
  X,
  MessageCircle,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Message {
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

interface Chat {
  _id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

interface SpeechRecognitionEvent {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
    };
  };
}

interface Voice {
  name: string;
  lang: string;
  voiceURI: string;
}

const SIDEBAR_WIDTH_OPEN = 240;
const SIDEBAR_WIDTH_CLOSED = 60;

// Add this before the component
// SpeechRecognition and webkitSpeechRecognition are not standard on window, so we use (window as any)
const SpeechRecognition =
  typeof window !== "undefined"
    ? (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    : undefined;

const ChatbotPage = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [speechRate, setSpeechRate] = useState(1.2);
  const [availableVoices, setAvailableVoices] = useState<Voice[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false); // closed by default
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<InstanceType<typeof SpeechRecognition> | null>(
    null
  );

  // Load available voices
  const loadVoices = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const loadVoicesInternal = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log("Available voices:", voices); // Debug log

        // Filter English voices and remove duplicates
        const englishVoices = voices
          .filter(
            (voice) =>
              voice.lang.startsWith("en") &&
              voice.name !== "Google UK English Female"
          )
          .filter(
            (voice, index, self) =>
              // Remove duplicates based on name and lang combination
              index ===
              self.findIndex(
                (v) => v.name === voice.name && v.lang === voice.lang
              )
          );

        console.log("English voices (filtered):", englishVoices); // Debug log
        setAvailableVoices(englishVoices);

        // Set default voice
        const defaultVoice =
          englishVoices.find(
            (voice) =>
              voice.name.includes("Female") ||
              voice.name.includes("Samantha") ||
              voice.name.includes("Victoria") ||
              voice.name.includes("Google") ||
              voice.name.includes("US")
          ) || englishVoices[0];

        if (defaultVoice) {
          setSelectedVoice(defaultVoice);
        }
      };

      // Try to load voices immediately
      loadVoicesInternal();

      // Set up event listener for when voices change
      window.speechSynthesis.onvoiceschanged = loadVoicesInternal;

      // Force a small delay and try again (some browsers need this)
      setTimeout(loadVoicesInternal, 100);
      setTimeout(loadVoicesInternal, 500);
      setTimeout(loadVoicesInternal, 1000);
    } else {
      console.warn("Speech synthesis not supported in this browser");
    }
  };

  // Manual refresh voices function
  const refreshVoices = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      // Force voices to reload
      window.speechSynthesis.getVoices();
      loadVoices();
    }
  };

  // Load chat history on mount
  useEffect(() => {
    fetchChats();
    // Delay voice loading to ensure user interaction
    const timer = setTimeout(loadVoices, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch user's chat history
  const fetchChats = async () => {
    try {
      const res = await fetch("/api/chats");
      const data = await res.json();
      if (data.chats) {
        setChats(data.chats);
        if (data.chats.length > 0 && !currentChat) {
          setCurrentChat(data.chats[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    }
    setLoadingChats(false);
  };

  // Create new chat
  const createNewChat = async () => {
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Chat" }),
      });
      const data = await res.json();
      if (data.chat) {
        const newChat = data.chat;
        setChats([newChat, ...chats]);
        setCurrentChat(newChat);
        setInput("");
      }
    } catch (error) {
      console.error("Failed to create new chat:", error);
    }
  };

  // Delete chat
  const deleteChat = async (chatId: string) => {
    try {
      await fetch(`/api/chats/${chatId}`, { method: "DELETE" });
      setChats(chats.filter((chat) => chat._id !== chatId));
      if (currentChat?._id === chatId) {
        setCurrentChat(
          chats.length > 1 ? chats.find((c) => c._id !== chatId) || null : null
        );
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  // Text-to-Speech: Speak bot replies with selected voice and speed
  const speak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      // Stop any current speech
      window.speechSynthesis.cancel();

      const utterance = new window.SpeechSynthesisUtterance(text);

      // Set voice if selected
      if (selectedVoice) {
        utterance.voice = selectedVoice as SpeechSynthesisVoice;
      }

      // Set speech rate
      utterance.rate = speechRate;

      // Set pitch and volume for better mental health assistant tone
      utterance.pitch = 1.1; // Slightly higher pitch for warmth
      utterance.volume = 0.9; // Good volume level

      window.speechSynthesis.speak(utterance);
    }
  };

  // Speech-to-Text: Start/stop listening
  const startListening = () => {
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || !currentChat) return;

    const userMessage = input;
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`/api/chats/${currentChat._id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await res.json();

      if (data.userMessage && data.botMessage) {
        // Update current chat with new messages
        const updatedChat = {
          ...currentChat,
          messages: [
            ...currentChat.messages,
            data.userMessage,
            data.botMessage,
          ],
        };
        setCurrentChat(updatedChat);

        // Update chats list
        setChats(
          chats.map((chat) =>
            chat._id === currentChat._id ? updatedChat : chat
          )
        );

        // Use voice summary for speech instead of full message
        const textToSpeak = data.voiceSummary || data.botMessage.text;
        speak(textToSpeak);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat?.messages]);

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "#f7f7f8", height: "calc(100vh - 20px)" }}
    >
      {/* Sidebar */}
      <div
        className={`transition-all duration-300 ease-in-out flex flex-col overflow-hidden z-30 shadow-xl border-r border-[#343541]`}
        style={{
          width: sidebarOpen ? SIDEBAR_WIDTH_OPEN : SIDEBAR_WIDTH_CLOSED,
          background: "#202123",
          minWidth: 0,
        }}
      >
        {/* Sidebar Toggle Button (always visible) */}
        <div className="flex items-center justify-center h-14 border-b border-[#343541]">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen((open) => !open)}
            className="text-white"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
        {/* Sidebar Content */}
        {sidebarOpen && (
          <>
            <div className="px-3 py-2 border-b border-[#343541]">
              <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-2">
                <MessageCircle className="w-4 h-4 text-[#19c37d]" />
                Chats
              </h2>
              <Button
                onClick={createNewChat}
                className="w-full bg-[#19c37d] hover:bg-[#15a86b] text-white font-medium py-2 rounded-md text-sm mb-2"
              >
                <Plus className="w-4 h-4 mr-1" />
                New
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto px-2 py-2">
              {loadingChats ? (
                <div className="text-center text-gray-400 py-8 text-xs">
                  Loading chats...
                </div>
              ) : chats.length === 0 ? (
                <div className="text-center text-gray-400 py-8 text-xs">
                  No chats yet
                </div>
              ) : (
                <div className="space-y-1">
                  {chats.map((chat) => (
                    <div
                      key={chat._id}
                      className={`rounded px-2 py-2 text-sm cursor-pointer flex items-center justify-between transition-all duration-200 ${
                        currentChat?._id === chat._id
                          ? "bg-[#343541] text-white"
                          : "hover:bg-[#353740] text-gray-200"
                      }`}
                      onClick={() => setCurrentChat(chat)}
                    >
                      <span className="truncate flex-1">{chat.title}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(chat._id);
                        }}
                        className="text-gray-400 hover:text-red-500"
                        aria-label="Delete chat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-2 border-t border-[#343541]">
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  className="w-full text-gray-300 text-xs"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Main Chat Area */}
      <div
        className="flex-1 flex flex-col relative"
        style={{ background: "#18181b" }}
      >
        {/* Top Bar */}
        <div
          className="flex items-center gap-2 px-4 py-2  bg-zinc-800"
          style={{ minHeight: 48 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen((open) => !open)}
            className="lg:hidden text-[#202123]"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">Mental Health Assistant</h1>
          {currentChat && (
            <Badge
              variant="secondary"
              className="ml-2 text-xs bg-[#ececf1] text-[#202123] border-none"
            >
              {currentChat.messages.length} messages
            </Badge>
          )}
        </div>

        {/* Chat Area */}
        <div
          className="flex-1 flex flex-col justify-end"
          style={{ minHeight: 0, height: "100%" }}
        >
          <div
            className="flex-1 overflow-y-auto px-0 py-4"
            ref={chatContainerRef}
            style={{ minHeight: 0 }}
          >
            {currentChat ? (
              <div className="flex flex-col gap-2 px-2">
                {currentChat.messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-lg text-sm shadow-sm whitespace-pre-line break-words ${
                        msg.sender === "user"
                          ? "bg-zinc-800  rounded-br-md"
                          : "bg-zinc-800  rounded-bl-md "
                      }`}
                    >
                      {msg.text}
                      <span className="block text-[10px] mt-1 opacity-60 text-right">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-xs">
                No chat selected
              </div>
            )}
          </div>

          {/* Input Area (sticky at bottom) */}
          <div
            className="w-full px-2 py-2 sticky bottom-0 z-10"
            style={{ boxShadow: "0 -2px 8px 0 rgba(0,0,0,0.02)" }}
          >
            <form onSubmit={sendMessage} className="flex gap-2 items-end">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={listening ? stopListening : startListening}
                className={
                  listening
                    ? "border-[#19c37d] text-[#19c37d] bg-[#e7f9f0]"
                    : "text-black dark:text-white"
                }
                aria-label={listening ? "Stop listening" : "Start listening"}
              >
                {listening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </Button>
              <div className="flex-1">
                <Input
                  type="text"
                  className="w-full rounded-xl px-4 py-2 text-sm "
                  placeholder={
                    listening ? "Listening..." : "Type your message..."
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading || listening}
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-sm font-semibold rounded-lg"
              >
                {loading ? "Sending..." : "Send"}
              </Button>
              {/* Voice Settings */}
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                  className="text-black dark:text-white"
                  aria-label="Voice Settings"
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
                {showVoiceSettings && (
                  <Card className="absolute bottom-12 right-0 mb-2 min-w-64 z-50 max-w-[calc(100vw-2rem)]">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Voice Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium mb-1">
                          Voice
                        </label>
                        {availableVoices.length > 0 ? (
                          <Select
                            value={selectedVoice?.voiceURI || ""}
                            onValueChange={(value) => {
                              const voice = availableVoices.find(
                                (v) => v.voiceURI === value
                              );
                              setSelectedVoice(voice || null);
                            }}
                          >
                            <SelectTrigger className="w-full text-xs">
                              <SelectValue placeholder="Select a voice" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableVoices.map((voice, index) => (
                                <SelectItem
                                  key={`${voice.name}-${voice.lang}-${index}`}
                                  value={voice.voiceURI}
                                >
                                  {voice.name} ({voice.lang})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-xs text-gray-500 p-2 border border-gray-300 rounded-md">
                              No voices available. Try refreshing or check
                              browser support.
                            </div>
                            <Button
                              type="button"
                              onClick={refreshVoices}
                              className="w-full"
                              size="sm"
                              variant="outline"
                            >
                              Refresh Voices
                            </Button>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">
                          Speed: {speechRate}x
                        </label>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={speechRate}
                          onChange={(e) =>
                            setSpeechRate(parseFloat(e.target.value))
                          }
                          className="w-full"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={() =>
                          speak("Hello! I'm your mental health assistant.")
                        }
                        className="w-full"
                        size="sm"
                        disabled={availableVoices.length === 0}
                      >
                        Test Voice
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
