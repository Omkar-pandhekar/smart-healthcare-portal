"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Plus, Mic, MicOff, HelpCircle, Volume2, Settings } from "lucide-react";

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

const ChatbotPage = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [speechRate, setSpeechRate] = useState(1.2);
  const [availableVoices, setAvailableVoices] = useState<Voice[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Load chat history on mount
  useEffect(() => {
    fetchChats();
    loadVoices();
  }, []);

  // Load available voices
  const loadVoices = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const voices = window.speechSynthesis.getVoices();
      const englishVoices = voices.filter(
        (voice) =>
          voice.lang.startsWith("en") &&
          voice.name !== "Google UK English Female"
      );
      setAvailableVoices(englishVoices);

      // Set default voice (prefer female voices for mental health assistant)
      const defaultVoice =
        englishVoices.find(
          (voice) =>
            voice.name.includes("Female") ||
            voice.name.includes("Samantha") ||
            voice.name.includes("Victoria")
        ) || englishVoices[0];

      if (defaultVoice) {
        setSelectedVoice(defaultVoice);
      }
    }
  };

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
        utterance.voice = selectedVoice;
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
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
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
    <div className="min-h-screen flex bg-gradient-to-r from-[#2d153c] via-[#e6f2fd] to-[#0bb1e3]">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={createNewChat}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg transition"
          >
            + New Chat
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-2">
          {loadingChats ? (
            <div className="text-center text-gray-500 py-4">
              Loading chats...
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center text-gray-500 py-4">No chats yet</div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat._id}
                className={`p-3 rounded-lg mb-2 cursor-pointer transition ${
                  currentChat?._id === chat._id
                    ? "bg-green-100 border border-green-300"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => setCurrentChat(chat)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {chat.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(chat.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat._id);
                    }}
                    className="text-red-500 hover:text-red-700 text-sm ml-2"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Back to Dashboard */}
        <div className="p-4 border-t border-gray-200">
          <Link href="/dashboard">
            <button className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg transition">
              ← Back to Dashboard
            </button>
          </Link>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        <div className="bg-white rounded-2xl shadow-xl m-4 flex flex-col h-[calc(100vh-2rem)]">
          <h2 className="text-2xl font-bold text-green-500 mb-2 text-center pt-6">
            Mental Health Chatbot
          </h2>

          {!currentChat ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p className="text-lg mb-4">
                  Welcome to your Mental Health Assistant
                </p>
                <button
                  onClick={createNewChat}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg transition"
                >
                  Start a New Chat
                </button>
              </div>
            </div>
          ) : (
            <>
              <div
                className="flex-1 overflow-y-auto px-4 py-2"
                style={{ minHeight: 0, scrollbarWidth: "thin" }}
                ref={chatContainerRef}
              >
                {currentChat.messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    } mb-4`}
                  >
                    <div
                      className={`px-5 py-3 rounded-2xl max-w-[75%] text-base shadow-md whitespace-pre-line break-words ${
                        msg.sender === "user"
                          ? "bg-green-100 text-green-900 rounded-br-md"
                          : "bg-gray-100 text-gray-800 rounded-bl-md"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-gray-200 px-4 py-3 bg-white sticky bottom-0">
                <form
                  onSubmit={sendMessage}
                  className="flex gap-3 items-center"
                >
                  <button
                    type="button"
                    onClick={listening ? stopListening : startListening}
                    className={`rounded-full p-3 border-2 ${
                      listening
                        ? "border-green-500 bg-green-100 animate-pulse"
                        : "border-gray-300 bg-white"
                    }`}
                    aria-label={
                      listening ? "Stop listening" : "Start listening"
                    }
                    tabIndex={0}
                  >
                    {listening ? (
                      <span role="img" aria-label="Listening">
                        🎤
                      </span>
                    ) : (
                      <span role="img" aria-label="Mic">
                        🎙️
                      </span>
                    )}
                  </button>
                  <input
                    type="text"
                    className="flex-1 border-2 border-green-400 rounded-lg px-4 py-3 focus:outline-none focus:border-green-600 text-base bg-white"
                    placeholder={
                      listening ? "Listening..." : "Type your message..."
                    }
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading || listening}
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg transition text-base"
                    disabled={loading}
                  >
                    {loading ? "..." : "Send"}
                  </button>

                  {/* Voice Settings Button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                      className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg transition-all duration-300 hover:scale-110"
                      title="Voice Settings"
                    >
                      <Volume2 className="h-5 w-5" />
                    </button>

                    {/* Voice Settings Menu */}
                    {showVoiceSettings && (
                      <div className="absolute bottom-12 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-64 z-50">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <Settings className="h-4 w-4 mr-2" />
                          Voice Settings
                        </h3>

                        {/* Voice Selection */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Voice
                          </label>
                          <select
                            value={selectedVoice?.voiceURI || ""}
                            onChange={(e) => {
                              const voice = availableVoices.find(
                                (v) => v.voiceURI === e.target.value
                              );
                              setSelectedVoice(voice || null);
                            }}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {availableVoices.map((voice) => (
                              <option
                                key={voice.voiceURI}
                                value={voice.voiceURI}
                              >
                                {voice.name} ({voice.lang})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Speed Control */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
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
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Slow</span>
                            <span>Fast</span>
                          </div>
                        </div>

                        {/* Test Voice Button */}
                        <button
                          type="button"
                          onClick={() =>
                            speak(
                              "Hello! I'm your mental health assistant. How can I help you today?"
                            )
                          }
                          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-md text-sm transition"
                        >
                          Test Voice
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Floating Action Button - Now positioned in the input area */}
                  <div className="relative">
                    {/* Floating Menu */}
                    {showFloatingMenu && (
                      <div className="absolute bottom-12 right-0 mb-2 space-y-2">
                        <button
                          onClick={createNewChat}
                          className="flex items-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
                        >
                          <Plus className="h-4 w-4" />
                          <span>New Chat</span>
                        </button>
                        <button
                          onClick={listening ? stopListening : startListening}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 ${
                            listening
                              ? "bg-red-500 hover:bg-red-600 text-white"
                              : "bg-white hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          {listening ? (
                            <MicOff className="h-4 w-4" />
                          ) : (
                            <Mic className="h-4 w-4" />
                          )}
                          <span>
                            {listening ? "Stop Voice" : "Voice Input"}
                          </span>
                        </button>
                        <Link href="/resources">
                          <button className="flex items-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg shadow-lg transition-all duration-200 hover:scale-105">
                            <HelpCircle className="h-4 w-4" />
                            <span>Resources</span>
                          </button>
                        </Link>
                      </div>
                    )}

                    {/* Main Floating Button */}
                    <button
                      type="button"
                      onClick={() => setShowFloatingMenu(!showFloatingMenu)}
                      className="bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-lg transition-all duration-300 hover:scale-110"
                    >
                      <Plus
                        className={`h-5 w-5 transition-transform duration-300 ${
                          showFloatingMenu ? "rotate-45" : ""
                        }`}
                      />
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
