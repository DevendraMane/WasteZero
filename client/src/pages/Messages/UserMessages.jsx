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

const UserMessages = ({ isDarkMode = false }) => {
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
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Typing indicator states
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  // Flag/Report states
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagReason, setFlagReason] = useState("abusive_language");
  const [flagDescription, setFlagDescription] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  // Block states
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [isBlockingUser, setIsBlockingUser] = useState(false);

  // Delete conversation states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeletingConversation, setIsDeletingConversation] = useState(false);

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

  /* ================= DEBOUNCE SEARCH ================= */

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300); // 300ms debounce delay

    return () => clearTimeout(debounceTimer);
  }, [search]);

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

  const fetchBlockedUsers = async () => {
    try {
      const res = await fetch(`${API}/api/messages/blocked/list`, {
        headers: { Authorization: authorizationToken },
      });

      if (res.ok) {
        const data = await res.json();
        setBlockedUsers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching blocked users:", error);
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchBlockedUsers();
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
        alert("✓ User reported successfully. Admin team will review shortly.");
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

  /* ================= BLOCK USER FUNCTION ================= */

  const handleBlockUser = async () => {
    if (!selectedUser) return;

    try {
      setIsBlockingUser(true);
      const res = await fetch(`${API}/api/messages/block`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorizationToken,
        },
        body: JSON.stringify({
          blockedUserId: selectedUser,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert("✓ " + data.message);
        await fetchBlockedUsers();
        setSelectedUser(null);
        setMessages([]);
      } else {
        const error = await res.json();
        alert("✗ " + error.message);
      }
    } catch (error) {
      console.error("Block error:", error);
      alert("Error blocking user");
    } finally {
      setIsBlockingUser(false);
    }
  };

  /* ================= UNBLOCK USER FUNCTION ================= */

  const handleUnblockUser = async (blockedUserId) => {
    try {
      const res = await fetch(`${API}/api/messages/unblock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorizationToken,
        },
        body: JSON.stringify({
          blockedUserId,
        }),
      });

      if (res.ok) {
        alert("✓ User unblocked successfully");
        await fetchBlockedUsers();
      } else {
        const error = await res.json();
        alert("✗ " + error.message);
      }
    } catch (error) {
      console.error("Unblock error:", error);
      alert("Error unblocking user");
    }
  };

  const filteredChats = useMemo(() => {
    if (!Array.isArray(conversations)) return [];

    return conversations.filter((c) =>
      (c.user?.name || "")
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase()),
    );
  }, [debouncedSearch, conversations]);

  /* ================= DELETE CONVERSATION FUNCTION ================= */

  const handleDeleteConversation = async () => {
    if (!selectedUser) return;

    try {
      setIsDeletingConversation(true);
      const conversationId =
        user._id < selectedUser._id
          ? `${user._id}_${selectedUser._id}`
          : `${selectedUser._id}_${user._id}`;

      const res = await fetch(`${API}/api/messages/delete-conversation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorizationToken,
        },
        body: JSON.stringify({
          conversationId,
          otherUserId: selectedUser._id,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Remove conversation from list
        setConversations(
          conversations.filter((conv) => conv._id !== conversationId),
        );

        // Clear messages and selected user
        setMessages([]);
        setSelectedUser(null);
        setDeleteConfirmOpen(false);

        alert("✓ Conversation deleted successfully");
      } else {
        const error = await res.json();
        alert("✗ " + error.message);
      }
    } catch (error) {
      console.error("Delete conversation error:", error);
      alert("Error deleting conversation");
    } finally {
      setIsDeletingConversation(false);
    }
  };

  return (
    <div
      className={`flex h-[80vh] rounded-2xl shadow overflow-hidden transition duration-300 ${
        isDarkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      {/* LEFT PANEL */}

      <div
        className={`w-1/3 flex flex-col transition duration-300 ${
          isDarkMode
            ? "border-gray-700 bg-gray-900 border-r"
            : "border-r border-gray-200 bg-gray-50"
        }`}
      >
        <div
          className={`p-4 border-b transition duration-300 ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <h2
            className={`text-lg font-semibold mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            Messages
          </h2>

          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full rounded-lg px-3 py-2 text-sm border transition duration-300 ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            }`}
          />

          {/* Show blocked users count (only for NGOs) */}
          {user?.role === "ngo" && blockedUsers.length > 0 && (
            <div
              className={`mt-3 p-2 rounded border transition duration-300 ${
                isDarkMode
                  ? "bg-orange-900 border-orange-700"
                  : "bg-orange-50 border-orange-200"
              }`}
            >
              <p
                className={`text-xs font-semibold ${isDarkMode ? "text-orange-200" : "text-orange-600"}`}
              >
                🚫 {blockedUsers.length} Blocked User
                {blockedUsers.length !== 1 ? "s" : ""}
              </p>
              <div className="mt-2 space-y-1">
                {blockedUsers.map((blockedUser) => (
                  <div
                    key={blockedUser._id}
                    className={`flex items-center justify-between text-xs p-1 rounded transition duration-300 ${
                      isDarkMode
                        ? "bg-gray-700 text-gray-300"
                        : "bg-white text-gray-700"
                    }`}
                  >
                    <span>{blockedUser.name}</span>
                    <button
                      onClick={() => handleUnblockUser(blockedUser._id)}
                      className={`font-semibold hover:underline ${
                        isDarkMode
                          ? "text-blue-400 hover:text-blue-300"
                          : "text-blue-600 hover:text-blue-700"
                      }`}
                    >
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((conv) => {
            const otherUser = conv.user?._id;

            return (
              <div
                key={conv._id}
                onClick={() => loadMessages(otherUser)}
                className={`p-4 cursor-pointer border-b transition duration-300 ${
                  isDarkMode
                    ? `border-gray-700 ${
                        selectedUser === otherUser
                          ? "bg-green-900"
                          : "hover:bg-gray-800"
                      }`
                    : `border-gray-200 ${
                        selectedUser === otherUser
                          ? "bg-green-100"
                          : "hover:bg-gray-100"
                      }`
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
                      alt={conv.user?.name}
                    />
                    <div
                      className={`absolute w-2.5 h-2.5 rounded-full bottom-0 right-0 border-2 ${
                        conv.user?.isOnline
                          ? "bg-green-500 border-white"
                          : isDarkMode
                            ? "bg-gray-600 border-gray-800"
                            : "bg-gray-300 border-white"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium text-sm truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {conv.user?.name}
                    </p>
                    <p
                      className={`text-xs truncate ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {conv.lastMessage || "No messages yet"}
                    </p>
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
            <div
              className={`p-4 border-b flex justify-between items-center transition duration-300 ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex-1">
                <h3
                  className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
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
                  <p
                    className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
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
                <div className="flex gap-2">
                  <button
                    onClick={() => setFlagModalOpen(true)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition duration-300"
                  >
                    🚩 Report
                  </button>
                  <button
                    onClick={handleBlockUser}
                    disabled={isBlockingUser}
                    className={`px-3 py-1 text-white text-sm rounded transition duration-300 ${
                      isBlockingUser
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-orange-600 hover:bg-orange-700"
                    }`}
                  >
                    🚫 Block
                  </button>
                </div>
              )}

              {/* Delete Conversation button */}
              <button
                onClick={() => setDeleteConfirmOpen(true)}
                className="px-3 py-1 bg-red-800 text-white text-sm rounded hover:bg-red-900 transition duration-300"
              >
                🗑️ Delete
              </button>
            </div>

            {/* CHAT BODY */}

            <div
              className={`flex-1 p-6 overflow-y-auto space-y-4 transition duration-300 ${
                isDarkMode ? "bg-gray-900" : "bg-gray-50"
              }`}
            >
              {messages.map((msg, i) => {
                const isMe = msg.sender_id?.toString() === user._id;

                return (
                  <div
                    key={i}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`px-4 py-2 rounded-xl max-w-xs text-sm transition duration-300 ${
                        isMe
                          ? "bg-green-600 text-white"
                          : isDarkMode
                            ? "bg-gray-700 text-gray-200 shadow"
                            : "bg-white text-gray-900 shadow"
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
                  <div
                    className={`px-4 py-2 rounded-xl text-sm transition duration-300 ${
                      isDarkMode
                        ? "bg-gray-700 text-gray-300 shadow"
                        : "bg-white text-gray-600 shadow"
                    }`}
                  >
                    <div className="flex gap-1">
                      <div
                        className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? "bg-gray-400" : "bg-gray-600"}`}
                      ></div>
                      <div
                        className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? "bg-gray-400" : "bg-gray-600"}`}
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? "bg-gray-400" : "bg-gray-600"}`}
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* INPUT */}

            <div
              className={`p-4 border-t flex gap-2 transition duration-300 ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={handleMessageChange}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                className={`flex-1 rounded-full px-4 py-2 border transition duration-300 ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
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
          <div
            className={`flex-1 flex items-center justify-center transition duration-300 ${
              isDarkMode
                ? "bg-gray-900 text-gray-400"
                : "bg-white text-gray-400"
            }`}
          >
            Select a conversation
          </div>
        )}
      </div>

      {/* REPORT MODAL */}
      {flagModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div
            className={`rounded-lg shadow-lg p-6 max-w-md w-full mx-4 transition duration-300 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h2
              className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}
            >
              Report User
            </h2>
            <p
              className={`text-sm mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              Help us maintain a safe community by reporting inappropriate
              behavior. Your report will be reviewed by our admin team.
            </p>

            <div className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  Report Reason
                </label>
                <select
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  className={`w-full rounded-lg px-3 py-2 border transition duration-300 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
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
                <label
                  className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  Description (Optional)
                </label>
                <textarea
                  value={flagDescription}
                  onChange={(e) => setFlagDescription(e.target.value)}
                  rows="3"
                  className={`w-full rounded-lg px-3 py-2 border transition duration-300 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  placeholder="Provide more details about the issue..."
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setFlagModalOpen(false);
                    setFlagReason("abusive_language");
                    setFlagDescription("");
                  }}
                  className={`px-4 py-2 border rounded-lg transition duration-300 ${
                    isDarkMode
                      ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                      : "border-gray-300 text-gray-900 hover:bg-gray-50"
                  }`}
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

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`rounded-xl p-6 w-96 shadow-lg transition duration-300 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
          >
            <h3
              className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}
            >
              Delete Conversation? 🗑️
            </h3>
            <p
              className={`mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              Are you sure you want to delete this conversation with{" "}
              <strong>
                {conversations.find((c) => c.user?._id === selectedUser)?.user
                  ?.name || "Unknown User"}
              </strong>
              ? This action cannot be undone and all messages will be
              permanently deleted.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={isDeletingConversation}
                className={`px-4 py-2 rounded-lg transition disabled:opacity-50 ${isDarkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-300 text-gray-700 hover:bg-gray-400"}`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConversation}
                disabled={isDeletingConversation}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {isDeletingConversation ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMessages;
