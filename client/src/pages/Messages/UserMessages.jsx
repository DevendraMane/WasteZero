import React, { useState, useMemo, useEffect } from "react";
import { useAuth } from "../../store/AuthContext";
import { useSearchParams } from "react-router-dom";
import {
  socket,
  emitUserOnline,
  emitTypingStart,
  emitTypingStop,
  setupMessageListener,
  removeMessageListener,
} from "../../utils/socket.js";

const UserMessages = () => {
  const { user, API, authorizationToken } = useAuth();

  const [searchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserStatus, setSelectedUserStatus] = useState({
    isOnline: false,
    lastSeen: null,
  });

  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");

  // Typing indicator states
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  // Flag/Report states
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagReason, setFlagReason] = useState("abusive_language");
  const [flagDescription, setFlagDescription] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  /* ================= SETUP SOCKET.IO ================= */

  useEffect(() => {
    // Connect socket only if user is logged in
    if (!socket.connected && user && user._id) {
      console.log("[Socket] Connecting socket for user:", user._id);
      socket.connect();
      emitUserOnline(user._id);
      console.log("[Socket] Emitted user_online event");
    }

    // Set up message listeners
    const handleSocketEvent = (eventData) => {
      if (eventData.type === "typing") {
        console.log("[Socket] Typing indicator received");
        setIsUserTyping(eventData.data.isTyping);
      } else if (eventData.type === "status_update") {
        console.log("[Socket] Status update received:", eventData.data);
        // Update conversation status
        setConversations((prev) =>
          prev.map((conv) =>
            conv.user._id === eventData.data.userId
              ? {
                  ...conv,
                  user: {
                    ...conv.user,
                    isOnline: eventData.data.isOnline,
                    lastSeen: eventData.data.lastSeen ?? conv.user.lastSeen,
                  },
                }
              : conv,
          ),
        );
        // Update selected user status if applicable
        if (selectedUser === eventData.data.userId) {
          console.log(
            "[Socket] Updating selected user status:",
            eventData.data,
          );
          setSelectedUserStatus((prev) => ({
            isOnline: eventData.data.isOnline,
            lastSeen: eventData.data.lastSeen ?? prev.lastSeen,
          }));
        }
      } else {
        // New message
        const msg = eventData;
        console.log("[Socket] Message received:", msg);
        if (
          (msg.sender_id === user._id && msg.receiver_id === selectedUser) ||
          (msg.sender_id === selectedUser && msg.receiver_id === user._id)
        ) {
          setMessages((prev) => [...prev, msg]);
        }
      }
    };

    setupMessageListener(handleSocketEvent);

    return () => {
      removeMessageListener();
    };
  }, [user._id, selectedUser]);

  /* ================= FETCH CONVERSATIONS ================= */

  const fetchConversations = async () => {
    const res = await fetch(`${API}/api/messages/conversations`, {
      headers: { Authorization: authorizationToken },
    });

    const data = await res.json();
    console.log("Conversations API:", data);
    if (Array.isArray(data)) {
      setConversations(data);
    } else {
      setConversations([]);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  /* ================= AUTO OPEN CHAT FROM URL ================= */

  useEffect(() => {
    const userId = searchParams.get("user");

    if (userId) {
      loadMessages(userId);
    }
  }, []);

  /* ================= LOAD MESSAGES ================= */

  const loadMessages = async (userId) => {
    setSelectedUser(userId);

    const res = await fetch(`${API}/api/messages/${userId}`, {
      headers: { Authorization: authorizationToken },
    });

    const data = await res.json();

    // Handle both formats: old (array) and new (object with messages and userStatus)
    if (Array.isArray(data)) {
      setMessages(data);
      setSelectedUserStatus({ isOnline: false, lastSeen: null });
    } else {
      setMessages(data.messages);
      setSelectedUserStatus(data.userStatus);
    }
  };

  // Refresh user status from API (called when switching conversations)
  const refreshUserStatus = async (userId) => {
    try {
      const res = await fetch(`${API}/api/messages/${userId}`, {
        headers: { Authorization: authorizationToken },
      });
      const data = await res.json();
      if (data.userStatus) {
        setSelectedUserStatus(data.userStatus);
      }
    } catch (error) {
      console.error("Error refreshing user status:", error);
    }
  };

  // When selectedUser changes, refresh their status
  useEffect(() => {
    if (selectedUser) {
      refreshUserStatus(selectedUser);
    }
  }, [selectedUser]);

  /* ================= SEND MESSAGE ================= */

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const res = await fetch(`${API}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorizationToken,
        },
        body: JSON.stringify({
          receiver_id: selectedUser,
          content: newMessage,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.message);
        return;
      }

      const data = await res.json();

      // Don't add message here - let socket.io listener handle it
      // to avoid duplicates when message comes through socket
      // setMessages((prev) => [...prev, data]);

      setNewMessage("");

      // Stop typing
      emitTypingStop(user._id, selectedUser);
      setIsUserTyping(false);

      fetchConversations(); // refresh left panel
    } catch (error) {
      console.error("Send error:", error);
    }
  };

  /* ================= TYPING INDICATOR ================= */

  const handleMessageChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    // Emit typing start
    if (value.length > 0 && !isUserTyping) {
      emitTypingStart(user._id, selectedUser);
    }

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout to stop typing after 1.5 seconds of inactivity
    const timeout = setTimeout(() => {
      emitTypingStop(user._id, selectedUser);
    }, 1500);

    setTypingTimeout(timeout);
  };

  /* ================= FORMAT LAST SEEN ================= */

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return "never";
    const date = new Date(lastSeen);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
  };

  /* ================= REPORT USER FUNCTION ================= */

  const handleReportUser = async () => {
    if (!selectedUser || !flagReason) return;

    try {
      setIsReporting(true);
      const res = await fetch(`${API}/api/messages/flag/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorizationToken,
        },
        body: JSON.stringify({
          reportedUserId: selectedUser,
          reason: flagReason,
          description: flagDescription,
        }),
      });

      if (res.ok) {
        alert("✓ User reported successfully");
        setFlagModalOpen(false);
        setFlagReason("abusive_language");
        setFlagDescription("");
      } else {
        const error = await res.json();
        alert("✗ " + error.message);
      }
    } catch (error) {
      console.error("Report error:", error);
      alert("Error reporting user");
    } finally {
      setIsReporting(false);
    }
  };

  const filteredChats = useMemo(() => {
    if (!Array.isArray(conversations)) return [];

    return conversations.filter((c) =>
      (c.user?.name || "").toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, conversations]);

  return (
    <div className="flex h-[80vh] bg-white rounded-2xl shadow overflow-hidden">
      {/* LEFT PANEL */}

      <div className="w-1/3 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b bg-white">
          <h2 className="text-lg font-semibold mb-3">Messages</h2>

          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((conv) => {
            const otherUser = conv.user?._id;

            return (
              <div
                key={conv._id}
                onClick={() => loadMessages(otherUser)}
                className={`p-4 cursor-pointer hover:bg-gray-100 border-b ${
                  selectedUser === otherUser ? "bg-green-100" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={
                        conv.user?.profileImage
                          ? conv.user.profileImage
                          : `https://ui-avatars.com/api/?name=${conv.user?.name}`
                      }
                      className="w-8 h-8 rounded-full"
                    />
                    {/* Online status indicator */}
                    {conv.user?.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-medium text-sm">{conv.user?.name}</p>

                    <p className="text-xs text-gray-500 truncate">
                      {conv.lastMessage}
                    </p>

                    {/* Show flagged status if user is flagged */}
                    {conv.user?.isFlaggedByAnyNGO && (
                      <p className="text-xs text-red-500 font-semibold">
                        🚩 Flagged ({conv.user?.reportFlags})
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL */}

      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* CHAT HEADER */}
            <div className="p-4 border-b flex justify-between items-center bg-white">
              <div className="flex-1">
                <h3 className="font-semibold">
                  {conversations.find((c) => c.user?._id === selectedUser)?.user
                    ?.name || "Unknown User"}
                </h3>

                {/* Status indicator */}
                <div className="flex items-center gap-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      selectedUserStatus.isOnline
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  ></div>
                  <p className="text-xs text-gray-500">
                    {selectedUserStatus.isOnline
                      ? "Online"
                      : `Last seen ${formatLastSeen(
                          selectedUserStatus.lastSeen,
                        )}`}
                  </p>
                </div>
              </div>

              {/* Report button (only for NGOs) */}
              {user?.role === "ngo" && (
                <button
                  onClick={() => setFlagModalOpen(true)}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                >
                  🚩 Report
                </button>
              )}
            </div>

            {/* CHAT BODY */}

            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50">
              {messages.map((msg, i) => {
                const isMe = msg.sender_id?.toString() === user._id;

                return (
                  <div
                    key={i}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`px-4 py-2 rounded-xl max-w-xs text-sm ${
                        isMe ? "bg-green-600 text-white" : "bg-white shadow"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isUserTyping && (
                <div className="flex justify-start">
                  <div className="px-4 py-2 rounded-xl bg-white shadow text-sm text-gray-600">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* INPUT */}

            <div className="p-4 border-t flex gap-2 bg-white">
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={handleMessageChange}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 border rounded-full px-4 py-2"
              />

              <button
                onClick={handleSend}
                className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a conversation
          </div>
        )}
      </div>

      {/* REPORT MODAL */}
      {flagModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold mb-4">Report User</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Reason
                </label>
                <select
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="abusive_language">Abusive Language</option>
                  <option value="inappropriate_behavior">
                    Inappropriate Behavior
                  </option>
                  <option value="spam">Spam</option>
                  <option value="fraud">Fraud</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={flagDescription}
                  onChange={(e) => setFlagDescription(e.target.value)}
                  rows="3"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Provide more details..."
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setFlagModalOpen(false);
                    setFlagReason("abusive_language");
                    setFlagDescription("");
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReportUser}
                  disabled={isReporting}
                  className={`px-4 py-2 text-white rounded-lg transition ${
                    isReporting
                      ? "bg-red-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {isReporting ? "Reporting..." : "Report User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMessages;
