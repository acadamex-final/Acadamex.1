/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Lock,
  Plus,
  Send,
  Copy,
  Check,
  ChevronRight,
  Trash2,
  Users,
  LogOut,
  Hash,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useFirebase } from "./FirebaseProvider";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { OperationType, handleFirestoreError } from "../services/firebase";

interface StoredRoom {
  code: string;
  title: string;
  createdAt: number;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  content: string;
  createdAt: number;
}

interface PrivateChatViewProps {
  directChatCode?: string;
  directChatTitle?: string;
  onClearDirectChat?: () => void;
}

export const PrivateChatView: React.FC<PrivateChatViewProps> = ({
  directChatCode,
  directChatTitle,
  onClearDirectChat,
}) => {
  const { db, auth, user } = useFirebase();
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [roomTitle, setRoomTitle] = useState<string>("");
  const [inputCode, setInputCode] = useState<string>("");
  const [newRoomTitle, setNewRoomTitle] = useState<string>("");
  
  // Chat messaging
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [creationError, setCreationError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Suggested / Saved rooms in local state & storage
  const [savedRooms, setSavedRooms] = useState<StoredRoom[]>([]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Load saved rooms from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("vantage_chat_rooms");
    if (stored) {
      try {
        setSavedRooms(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse saved rooms", e);
      }
    }
  }, []);

  // Save rooms dynamically
  const saveRoomToList = (code: string, title: string) => {
    setSavedRooms((prev) => {
      if (prev.some((r) => r.code === code)) return prev;
      const updated = [
        { code, title: title || `Chat Suite ${code}`, createdAt: Date.now() },
        ...prev,
      ];
      localStorage.setItem("vantage_chat_rooms", JSON.stringify(updated));
      return updated;
    });
  };

  // Direct chat handshaking
  useEffect(() => {
    if (directChatCode && db && user) {
      const cleanedCode = directChatCode.toUpperCase();
      const title = directChatTitle || `Chat Suite ${cleanedCode}`;
      
      const setupDirectChat = async () => {
        setLoading(true);
        try {
          const roomRef = doc(db, "chat_rooms", cleanedCode);
          const snap = await getDoc(roomRef);
          if (!snap.exists()) {
            await setDoc(roomRef, {
              id: cleanedCode,
              title: title,
              createdBy: user.uid,
              createdByName: user.displayName || user.email || "System",
              createdAt: Date.now(),
            });
          }
          saveRoomToList(cleanedCode, title);
          setActiveRoom(cleanedCode);
          setRoomTitle(title);
        } catch (err) {
          console.error("Direct chat auto-init issue:", err);
        } finally {
          setLoading(false);
          if (onClearDirectChat) {
            onClearDirectChat();
          }
        }
      };

      setupDirectChat();
    }
  }, [directChatCode, db, user]);

  // Remove saved room from list
  const forgetRoom = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedRooms.filter((r) => r.code !== code);
    setSavedRooms(updated);
    localStorage.setItem("vantage_chat_rooms", JSON.stringify(updated));

    if (activeRoom === code) {
      setActiveRoom(null);
      setMessages([]);
    }
  };

  // Generate 6-digit alphanumeric uppercase room code
  const generateRoomCode = (): string => {
    const chars = "ABCDEFGHJKLMNOPQRSTUVWXYZ23456789"; // clear readable characters
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Join a room with user-input code
  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const cleanedCode = inputCode.trim().toUpperCase();

    if (!cleanedCode || cleanedCode.length < 3 || cleanedCode.length > 20) {
      setErrorMsg("INVALID CODE. ROOM CODES MUST BE BETWEEN 3 AND 20 CHARACTERS.");
      return;
    }

    if (!db) {
      setErrorMsg("DATABASE NODE OFFLINE.");
      return;
    }

    setLoading(true);
    const path = `chat_rooms/${cleanedCode}`;
    try {
      const roomSnap = await getDoc(doc(db, "chat_rooms", cleanedCode));
      if (!roomSnap.exists()) {
        setErrorMsg("CHAT ROOM NOT FOUND. INITIATE A NEW PRIVATE SUITE INSTEAD.");
        setLoading(false);
        return;
      }

      const data = roomSnap.data();
      const title = data.title || `Chat Suite ${cleanedCode}`;
      setRoomTitle(title);
      saveRoomToList(cleanedCode, title);
      setActiveRoom(cleanedCode);
      setInputCode("");
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.GET, path, auth);
      } catch (formattedErr: any) {
        setErrorMsg("COMMUNICATION BLOCKED BY CRYPTOGRAPHIC PROTOCOLS.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Create/Initialize a new private suite
  const handleCreateSuite = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreationError(null);

    if (!db || !user) {
      setCreationError("AUTHENTICATION AND DATABASE REQUIRED.");
      return;
    }

    setLoading(true);
    const title = newRoomTitle.trim() || `Suite ${generateRoomCode().substring(0, 3)}`;
    let generatedCode = generateRoomCode();
    let collisionCheck = true;

    // Small loop to prevent extremely rare collisions
    let attempts = 0;
    while (collisionCheck && attempts < 5) {
      attempts++;
      try {
        const snap = await getDoc(doc(db, "chat_rooms", generatedCode));
        if (!snap.exists()) {
          collisionCheck = false;
        } else {
          generatedCode = generateRoomCode();
        }
      } catch (err) {
        collisionCheck = false;
      }
    }

    const path = `chat_rooms/${generatedCode}`;
    try {
      await setDoc(doc(db, "chat_rooms", generatedCode), {
        id: generatedCode,
        title,
        createdBy: user.uid,
        createdByName: user.displayName || user.email || "Student",
        createdAt: Date.now(),
      });

      saveRoomToList(generatedCode, title);
      setActiveRoom(generatedCode);
      setRoomTitle(title);
      setNewRoomTitle("");
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, path, auth);
      } catch (formattedErr: any) {
        setCreationError("SECURE INITIATION FAILED. SECURITY CLEARANCE ERROR.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to real-time message stream for active room
  useEffect(() => {
    if (!activeRoom || !db) return;

    setMessages([]);
    const path = `chat_rooms/${activeRoom}/messages`;
    
    const unsubscribe = onSnapshot(
      query(
        collection(db, "chat_rooms", activeRoom, "messages"),
        orderBy("createdAt", "asc"),
        limit(200)
      ),
      (snapshot) => {
        const list: ChatMessage[] = [];
        snapshot.forEach((snapDoc) => {
          list.push({ id: snapDoc.id, ...snapDoc.data() } as ChatMessage);
        });
        setMessages(list);
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.GET, path, auth);
        } catch (formattedErr: any) {
          console.error("Subscription security restriction:", formattedErr);
        }
      }
    );

    return () => unsubscribe();
  }, [activeRoom, db]);

  // Scroll to bottom helper
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeRoom]);

  // Copy Room Code to Clipboard
  const handleCopyCode = () => {
    if (!activeRoom) return;
    navigator.clipboard.writeText(activeRoom);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Transmit Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = messageInput.trim();
    if (!content || !activeRoom || !db || !user) return;

    const path = `chat_rooms/${activeRoom}/messages`;
    setMessageInput("");

    try {
      await addDoc(collection(db, "chat_rooms", activeRoom, "messages"), {
        senderId: user.uid,
        senderName: user.displayName || user.email?.split("@")[0] || "Anonymous Student",
        senderEmail: user.email || "hidden@college.edu",
        content,
        createdAt: Date.now(),
      });
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, path, auth);
      } catch (formattedErr: any) {
        console.error("Failed to transmit package:", formattedErr);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-140px)] animate-in fade-in duration-200">
      
      {/* Side Control Desk: Creation / Join / Recent Rooms */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Terminal Card: Access Hub */}
        <div className="vantage-card bg-[#050505] border border-zinc-800 p-6 space-y-5 rounded-none relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B5CF6]/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-2">
            <Lock size={15} className="text-[#8B5CF6]" />
            <span className="text-[10px] font-mono tracking-widest text-[#8B5CF6] uppercase font-bold">
              Secure Core Protocols
            </span>
          </div>

          <h3 className="font-sans font-medium text-lg text-white leading-tight">
            Vantage Chat Suites
          </h3>
          
          <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
            Initialize an isolated, encrypted-by-key real-time private channel. Share the short numeric passphrase with friends to begin collaborative communications.
          </p>

          <div className="border-t border-zinc-900 pt-4 space-y-4">
            
            {/* Action 1: Join Room */}
            <form onSubmit={handleJoinByCode} className="space-y-2">
              <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold">
                Join Active Suite
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={20}
                  placeholder="CODE (e.g. SEC-TBRV7Y)"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  disabled={loading}
                  className="flex-1 bg-zinc-950 border border-zinc-800 px-3 py-2 text-white text-xs font-mono uppercase focus:outline-none focus:border-[#8B5CF6] transition-all rounded-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-zinc-900 border border-zinc-800 text-white px-4 text-xs font-mono uppercase hover:bg-zinc-800 transition-colors cursor-pointer rounded-none flex items-center justify-center"
                >
                  {loading ? "..." : <ChevronRight size={14} />}
                </button>
              </div>
              {errorMsg && (
                <div className="flex items-center gap-1.5 text-rose-500 text-[9px] font-mono uppercase tracking-wider mt-1">
                  <AlertCircle size={10} />
                  <span>{errorMsg}</span>
                </div>
              )}
            </form>

            {/* Action 2: Create Room */}
            <form onSubmit={handleCreateSuite} className="space-y-2 border-t border-zinc-900/50 pt-4">
              <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold">
                Deploy Private Suite
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={30}
                  placeholder="SUITE NAME (OPTIONAL)"
                  value={newRoomTitle}
                  onChange={(e) => setNewRoomTitle(e.target.value)}
                  disabled={loading}
                  className="flex-1 bg-zinc-950 border border-zinc-800 px-3 py-2 text-white text-xs font-sans focus:outline-none focus:border-[#8B5CF6] transition-all rounded-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/30 px-3.5 hover:bg-[#8B5CF6]/20 transition-all font-mono text-[10px] font-bold uppercase rounded-none flex items-center gap-1 shrink-0"
                >
                  <Plus size={13} />
                  {loading ? "..." : "INIT"}
                </button>
              </div>
              {creationError && (
                <div className="flex items-center gap-1.5 text-rose-500 text-[9px] font-mono uppercase tracking-wider mt-1">
                  <AlertCircle size={10} />
                  <span>{creationError}</span>
                </div>
              )}
            </form>

          </div>
        </div>

        {/* Saved Sessions Cabinet */}
        <div className="vantage-card bg-[#050505] border border-zinc-800 p-6 rounded-none space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
              Recent Comms Suites
            </span>
            <span className="text-[9px] bg-zinc-900 px-1.5 py-0.5 text-zinc-400 font-mono">
              {savedRooms.length} Active
            </span>
          </div>

          <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {savedRooms.map((room) => {
                const isActive = activeRoom === room.code;
                return (
                  <motion.div
                    key={room.code}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    onClick={() => {
                      setActiveRoom(room.code);
                      setRoomTitle(room.title);
                    }}
                    className={`group/r p-3 border text-left cursor-pointer transition-all flex items-center justify-between rounded-none ${
                      isActive
                        ? "bg-[#8B5CF6]/10 border-[#8B5CF6] text-white"
                        : "bg-zinc-950/40 border-zinc-850 text-zinc-400 hover:border-zinc-750 hover:bg-zinc-950"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-extrabold uppercase truncate leading-snug">
                        {room.title}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="font-mono text-[8.5px] bg-zinc-900 group-hover/r:bg-[#8B5CF6]/20 px-1 py-0.5 text-zinc-400 group-hover/r:text-[#8B5CF6] transition-colors uppercase font-bold tracking-wider rounded-none leading-none">
                          {room.code}
                        </span>
                        <span className="text-[8px] text-zinc-600 font-mono uppercase">
                          • {new Date(room.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => forgetRoom(room.code, e)}
                      className="text-zinc-600 hover:text-rose-500 p-1.5 transition-colors duration-150 shrink-0"
                      title="Decommission locally"
                    >
                      <Trash2 size={12} />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {savedRooms.length === 0 && (
              <div className="text-center py-8 border border-dashed border-zinc-900">
                <p className="text-[10px] text-zinc-650 font-mono uppercase italic">
                  No active channels on record.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Main Secure Active Terminal Frame (The Chat Pane) */}
      <div className="lg:col-span-8 flex flex-col h-[calc(100vh-140px)] border border-zinc-800 bg-[#050505]">
        <AnimatePresence mode="wait">
          {activeRoom ? (
            <motion.div
              key={activeRoom}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full overflow-hidden"
            >
              
              {/* Header Interface */}
              <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-900 flex items-center justify-between">
                <div>
                  <h4 className="text-[12px] font-bold text-white uppercase tracking-wider font-sans">
                    {roomTitle}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-mono text-zinc-400 font-extrabold uppercase">
                      Suite Secure Address: <strong className="text-[#8B5CF6]">{activeRoom}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Share button */}
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[10px] font-bold px-3 py-1.5 uppercase transition-all duration-150 rounded-none cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check size={11} className="text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={11} className="text-zinc-400" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>

                  {/* Disconnect Room View */}
                  <button
                    onClick={() => setActiveRoom(null)}
                    className="p-1 px-2 border border-zinc-850 hover:bg-rose-500/10 hover:border-rose-500/20 text-zinc-500 hover:text-rose-400 transition-colors uppercase font-mono text-[9px]"
                    title="Exit terminal suite view"
                  >
                    Disconnect
                  </button>
                </div>
              </div>

              {/* Feed Display Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#030303]">
                {messages.length > 0 ? (
                  messages.map((msg, index) => {
                    const isMe = user && msg.senderId === user.uid;
                    const initials = msg.senderName
                      ? msg.senderName.substring(0, 2).toUpperCase()
                      : "??";

                    // Show date separator if diff day
                    const msgDate = new Date(msg.createdAt).toLocaleDateString();
                    const prevMsg = index > 0 ? messages[index - 1] : null;
                    const prevDate = prevMsg ? new Date(prevMsg.createdAt).toLocaleDateString() : null;
                    const showSeparator = msgDate !== prevDate;

                    return (
                      <React.Fragment key={msg.id}>
                        {showSeparator && (
                          <div className="flex items-center justify-center py-2">
                            <span className="font-mono text-[8px] bg-zinc-950 px-2 py-0.5 border border-zinc-900/80 text-zinc-500 tracking-widest uppercase">
                              {msgDate}
                            </span>
                          </div>
                        )}
                        
                        <div className={`flex items-start gap-3 opacity-95 ${isMe ? "justify-end" : "justify-start"}`}>
                          
                          {/* Sender icon (Left card) */}
                          {!isMe && (
                            <div className="w-8 h-8 font-mono text-[10px] font-black border border-zinc-800 bg-zinc-900 text-zinc-400 flex items-center justify-center shrink-0">
                              {initials}
                            </div>
                          )}

                          {/* Chat body layout */}
                          <div className={`max-w-[70%] flex flex-col space-y-1 ${isMe ? "items-end" : "items-start"}`}>
                            <div className="flex items-center gap-1.5 px-0.5">
                              <span className="text-[8.5px] font-bold text-zinc-500 uppercase">
                                {isMe ? "YOU" : msg.senderName}
                              </span>
                              <span className="text-[7px] text-zinc-650 font-mono">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <div
                              className={`p-3.5 text-xs font-sans leading-relaxed whitespace-pre-wrap ${
                                isMe
                                  ? "bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-white rounded-none selection:bg-[#8B5CF6]/40"
                                  : "bg-zinc-950 border border-zinc-850 text-zinc-300 rounded-none"
                              }`}
                            >
                              {msg.content}
                            </div>
                          </div>

                          {/* Sender icon (Right card for 'Me') */}
                          {isMe && (
                            <div className="w-8 h-8 font-mono text-[10px] font-black border border-[#8B5CF6]/40 bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center shrink-0">
                              {initials}
                            </div>
                          )}

                        </div>
                      </React.Fragment>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20 space-y-4">
                    <div className="p-3 bg-zinc-950 border border-zinc-850 text-[#8B5CF6]">
                      <Sparkles size={24} className="animate-pulse" />
                    </div>
                    <div className="space-y-1.5">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-[#8B5CF6] font-extrabold">
                        TERMINAL ACTIVE // ZERO DATA TRANSMITTED
                      </p>
                      <p className="text-[11px] text-zinc-400 max-w-[320px] font-sans">
                        Introduce the secure code <strong className="text-white bg-zinc-950 px-1 font-mono">{activeRoom}</strong> to your friends so they can link into this dynamic feed.
                      </p>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Feed Transmission Controls (Submit Area) */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 bg-zinc-950 border-t border-zinc-900 flex gap-2 items-center"
              >
                <input
                  type="text"
                  maxLength={1000}
                  placeholder="TRANSMIT SECURE MASSAGE PACKAGE..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-zinc-200 text-xs font-sans focus:outline-none focus:border-[#8B5CF6] transition-all rounded-none"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider font-extrabold flex items-center gap-1.5 rounded-none shrink-0 transition-all cursor-pointer ${
                    messageInput.trim()
                      ? "bg-[#8B5CF6] hover:bg-[#7c4ee4] text-white"
                      : "bg-zinc-900/60 text-zinc-650 border border-zinc-900 cursor-not-allowed"
                  }`}
                >
                  <Send size={12} />
                  <span>Send</span>
                </button>
              </form>

            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-5">
              <div className="p-4 bg-zinc-950 border border-zinc-900 text-zinc-500">
                <MessageSquare size={32} />
              </div>
              
              <div className="space-y-2">
                <h5 className="font-sans font-medium text-white text-base">
                  No Active Communication Suite
                </h5>
                <p className="text-[11px] text-zinc-400 max-w-sm leading-relaxed mx-auto">
                  Select an initialized suite from the recent sessions list, enter an access code, or deploy a new private chat container on the campus grid.
                </p>
              </div>

              <div className="w-full max-w-[240px] border-t border-zinc-900 pt-3">
                <span className="font-mono text-[9px] text-zinc-600 block uppercase">
                  Protocols: HTTPS // FIRESTORE REALTIME
                </span>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};
